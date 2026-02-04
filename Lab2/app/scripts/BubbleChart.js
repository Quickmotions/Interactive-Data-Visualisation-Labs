export default class BubbleChart {
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
            .classed('bubblechart', true);
    }

    render(data) {
        const svgHeight = +this.svg.attr('height');
        const svgWidth = +this.svg.attr('width');
        const maxValue = d3.max(data, d => d.v);

        const minRadius = 5;
        const maxRadius = 50; // max visual radius

        this.svg
            .selectAll('circle')
            .data(data, d => d.v)
            .join('circle')
            .classed('bubble', true)
            .attr('cx', (d, i) => (i + 1) * (svgWidth / (data.length + 1))) // distribute evenly across width 
            .attr('cy', svgHeight / 2)
            .attr('r', d => {
                // Scale radius relative to maxValue
                const r = (d.v / maxValue) * maxRadius;
                return Math.max(r, minRadius); // ensure minimum size
            })
            .style('fill', d => d.v < maxValue * 0.6 ? '#4a79ba' : '#1a1a1a')
            .style('stroke', d => d.v < maxValue * 0.6 ? '#192b38' : '#000');
    }

}
