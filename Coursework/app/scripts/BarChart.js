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
        this.width = 0; // updates in #resize
        this.height = 0;

        // Flags
        this.fixedScaleEnabled = false;
        this.fixedMin = 0;
        this.fixedMax = null;

        // Containers
        this.svg = d3.select(container)
            .append('svg')
            .classed('barchart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);

        // Axes
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

        // Axes Labels
        this.svg.selectAll('.x-axis-label').data([null]).join('text')
            .attr('class', 'x-axis-label')
            .attr('x', this.margin[2] + this.chartWidth / 2)
            .attr('y', this.height - 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('Total energy usage (Mtoe)');
    }

    enableAutoResize(data) {
        const observer = new ResizeObserver(() => {
            this.render(data);
        });

        observer.observe(this.container.node());
    }

    setFixedScales(min, max) {
        this.fixedScaleEnabled = true;
        this.fixedMin = min;
        this.fixedMax = max;
    }

    #updateScales(data) {
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        const maxValue = this.fixedScaleEnabled && this.fixedMax !== null
            ? this.fixedMax
            : d3.max(data, d => d.v);

        const minValue = this.fixedScaleEnabled
            ? this.fixedMin
            : 0;

        this.#scaleX = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([0, this.chartWidth]);

        this.#scaleY = d3.scaleBand()
            .domain(data.map(d => d.k))
            .range([0, this.chartHeight])
            .padding(0.1);

        this.#scaleColor = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range(["#ff9f9f", "#960000"]);
    }

    // adapter for new input into older graph from lab 
    #formatData(data) {
        return Object.entries(data)
            .filter(([key]) => key !== "Year")
            .map(([key, value]) => ({
                k: key,
                v: value
            }));
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
