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

    constructor(container, width, height, margin) {
        this.container = container;
        this.width = width;
        this.height = height;
        this.margin = margin;

        // Append the SVG element
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('barchart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);

        this.axisX = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.height - this.margin[1]})`);
        this.axisY = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.margin[0]})`);
    }

    render(data) {

        this.#updateScales(data);

        this.chart
            .selectAll('rect')
            .data(data, d => d.k)
            .join('rect')
            .attr('x', d => this.#scaleX(d.k))
            .attr('width', this.#scaleX.bandwidth())
            .attr('y', d => this.#scaleY(d.v))
            .attr('height', d => this.chartHeight - this.#scaleY(d.v))
            .attr('fill', d => this.#scaleColor(d.v));

        // Update the axes
        let xAxis = d3.axisBottom(this.#scaleX),
            yAxis = d3.axisLeft(this.#scaleY);
        this.axisX.call(xAxis);
        this.axisY.call(yAxis);
    }

    #updateScales(data) {
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        this.#scaleX = d3.scaleBand() // scale used for categorical data
            .domain(data.map(d => d.k)) // unpacks data find all items
            .range([0, this.chartWidth])
            .padding(0.1);  // 10% of band width as padding

        // when this.#scaleX("B") is run, returns x pos for the bar

        this.#scaleY = d3.scaleLinear() // scale used for numerical data to px
            .domain([0, d3.max(data, d => d.v)]) // sets domain [0, maxVal]
            .range([this.chartHeight, 0]); // inverted range height

        // when this.#scaleX("B") is run, returns y px val for bar to start at

        this.#scaleColor = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.v)])
            .range(["#ff9f9f", "#960000"]);
    }

}
