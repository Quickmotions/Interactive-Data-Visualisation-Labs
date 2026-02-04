export default class BarChart {

    constructor(location, width, height) {
        this.container = location;
        this.width = width;
        this.height = height;
        this.container = d3.select(location);

        // Append the SVG element
        this.svg = this.container
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('barchart', true);
    }

    render(data) {
        const svgHeight = +this.svg.attr('height');
        const svgWidth = +this.svg.attr('width');
        const barWidth = 40;
        const gap = 5;

        const maxValue = d3.max(data, d => d.v);

        this.svg
            .selectAll('rect')
            .data(data, d => d.k)
            .join('rect')
            .classed('bar', true)
            .attr('x', (d, i) => i * (barWidth + gap))
            .attr('width', barWidth)
            .attr('height', d => {
                const h = (d.v / maxValue) * (svgHeight * 0.9); // scale to 90% of SVG
                return Math.max(h, 5); // minimum height 5px
            })
            .attr('y', d => svgHeight - Math.max((d.v / maxValue) * (svgHeight * 0.9), 5))
            .style('fill', d => d.v < maxValue * 0.5 ? '#ba4a53' : null)
            .style('stroke', d => d.v < maxValue * 0.5 ? '#381619' : null);
    }
}   