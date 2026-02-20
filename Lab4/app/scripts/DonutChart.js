// Lab 4 Donut Chart

/*

*/
export default class DonutChart {
    #scaleArc;

    constructor(container, width, height, margin) {
        this.width = width;
        this.height = height;
        this.margin = margin;

        // Append the SVG element
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('donutchart', true);

        this.chart = this.svg.append('g')
            .attr('transform',
                `translate(${width / 2}, ${height / 2})`);

    }

    render(data) {
        let chartWidth = this.width - this.margin[2] - this.margin[3],
            chartHeight = this.height - this.margin[0] - this.margin[1];

        let pieGen = d3.pie().padAngle(0.02)
            .sort(null).value(d => d.v);

        let pieData = pieGen(data);

        // arc generator
        let arcGen = d3.arc()
            .innerRadius(chartWidth / 4)
            .outerRadius(chartWidth / 2 - 5);

        // drawing arcs
        this.chart
            .selectAll('path')
            .data(pieData, d => d.data.k)
            .join('path')
            .attr('fill', 'cadetblue').attr('fill-opacity', 0.8)
            .attr('stroke', 'cadetblue').attr('stroke-width', 2)
            .attr('d', arcGen);
    }
}
