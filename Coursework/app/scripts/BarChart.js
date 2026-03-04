/*
  - container: DOM selector
  - width: visualisation width
  - height: visualisation height
  - margin: chart area margins [top, bottom, left, right]
*/
export default class BarChart {
    #scaleX;
    #scaleY;
    #scaleColor;

    constructor(container, margin) {
        this.container = d3.select(container);
        this.margin = margin;
        // initial dimensions are unknown until resize
        this.width = 0;
        this.height = 0;

        // Append the SVG element
        this.svg = d3.select(container)
            .append('svg')
            .classed('barchart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);
        this.axisX = this.svg.append('g');
        this.axisY = this.svg.append('g');
    }

    render(data) {
        data = this.#formatData(data)
        this.#resize();
        this.#updateScales(data);

        this.chart
            .selectAll('rect')
            .data(data, d => d.k)
            .join('rect')
            .attr('x', 0)
            .attr('y', d => this.#scaleY(d.k))
            .attr('width', d => this.#scaleX(d.v))
            .attr('height', this.#scaleY.bandwidth())
            .attr('fill', d => this.#scaleColor(d.v));

        let xAxis = d3.axisBottom(this.#scaleX),
            yAxis = d3.axisLeft(this.#scaleY);

        this.axisX.call(xAxis);
        this.axisY.call(yAxis);
    }

    enableAutoResize(data) {
        const observer = new ResizeObserver(() => {
            this.render(data);
        });

        observer.observe(this.container.node());
    }

    #updateScales(data) {
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        // Horizontal value scale (bar length → left to right)
        this.#scaleX = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.v)])
            .range([0, this.chartWidth]);

        // Vertical category scale
        this.#scaleY = d3.scaleBand()
            .domain(data.map(d => d.k))
            .range([0, this.chartHeight])
            .padding(0.1);

        this.#scaleColor = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.v)])
            .range(["#ff9f9f", "#960000"]);
    }

    #formatData(data) {
        return data.map(obj => {
            const values = Object.values(obj);

            return {
                k: values[0],
                v: values[1]
            };
        });
    }

    #resize() {
        const bounds = this.container.node().getBoundingClientRect();

        this.width = bounds.width;
        this.height = bounds.height;

        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        this.chart
            .attr('transform', `translate(${this.margin[2]}, ${this.margin[0]})`);

        this.axisX
            .attr('transform', `translate(${this.margin[2]}, ${this.height - this.margin[1]})`);

        this.axisY
            .attr('transform', `translate(${this.margin[2]}, ${this.margin[0]})`);
    }


}
