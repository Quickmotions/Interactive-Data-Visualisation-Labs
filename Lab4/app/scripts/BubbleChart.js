// Lab 3 Adding Scales

/*
  - container: DOM selector
  - width: visualisation width
  - height: visualisation height
  - margin: chart area margins [top, bottom, left, right]
*/
export default class BubbleChart {
    #scaleX;
    #scaleR;
    #scaleColor;

    constructor(container, width, height, margin) {
        this.width = width;
        this.height = height;
        this.margin = margin;


        // Append the SVG element
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('bubblechart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.margin[0]})`);

        this.axisX = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.height - this.margin[1]})`);
        this.axisY = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.margin[0]})`);
    }

    render(data) {
        this.#updateScales(data);

        // Update the circles
        this.chart
            .selectAll('circle')
            .data(data, d => d.k)
            .join('circle')
            .attr('cx', d => this.#scaleX(d.k))
            .attr('cy', d => this.chartHeight / 2)
            .attr('r', d => this.#scaleR(d.v))
            .attr('fill', d => this.#scaleColor(d.v));

        // Update the axes
        let xAxis = d3.axisBottom(this.#scaleX);
        this.axisX.call(xAxis);
    }

    #updateScales(data) {
        // Update scales here
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        let minDistance = this.chartWidth / data.length;
        let maxR = Math.min(this.chartHeight / 2, minDistance / 2);
        let maxValue = d3.max(data, d => d.v);

        this.#scaleX = d3.scalePoint()
            .domain(data.map(d => d.k))
            .range([maxR, this.chartWidth - maxR])
            .padding(0.1);

        this.#scaleR = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([5, maxR - 5]); // 5 px space between bubbles that are same value

        this.#scaleColor = d3.scaleLinear()
            .domain([0, maxValue])
            .range(["#a6cee3", "#1f78b4"]);
    }
}
