/*
  - container: DOM selector
  - width: visualisation width
  - height: visualisation height
  - margin: chart area margins [top, bottom, left, right]
*/
export default class BarChart {

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
    }

    render(data) {
        const height = +this.svg.attr('height') - this.margin[0] - this.margin[1];
        const barWidth = 40;
        const gap = 5;

        const maxValue = d3.max(data, d => d.v); // find max value for scaling from data

        this.chart
            .selectAll('rect')
            .data(data, d => d.k)
            .join('rect')
            .attr('x', (d, i) => i * (barWidth + gap))
            .attr('width', barWidth)
            .attr('height', d => (d.v / maxValue) * height) // scale bar height relative to maxValue
            .attr('y', d => height - (d.v / maxValue) * height); // position bars from bottom up

    }
}