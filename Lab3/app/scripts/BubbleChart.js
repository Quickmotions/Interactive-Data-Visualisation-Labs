/*
  - container: DOM selector
  - width: visualisation width
  - height: visualisation height
  - margin: chart area margins [top, bottom, left, right]
*/
export default class BubbleChart {
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
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);
    }

    render(data) {
        const width = +this.svg.attr('width');
        const height = +this.svg.attr('height');

        const maxValue = d3.max(data, d => d.v);
        // const maxRadius = 50; // maximum radius for the largest bubble

        this.chart
            .selectAll('circle')
            .data(data, d => d.k)
            .join('circle')
            .attr('cx', (d, i) => (i + 1) * (width / (data.length + 1)))
            .attr('cy', height / 2)
            .attr('r', d => (d.v / maxValue) * (height / data.length)); // scale radius relative to maxValue and available space
    }

}
