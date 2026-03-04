// Lab 4 Line Chart

export default class LineChart {
    #scaleX;
    #scaleY;
    #scaleCurve;

    constructor(container, width, height, margin) {
        this.width = width;
        this.height = height;
        this.margin = margin;

        // Append the SVG element
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('linechart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.margin[0]})`);

        this.axisX = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.height - this.margin[1]})`);
        this.axisY = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.margin[0]})`);
    }

    render(data) {

        data = data.sort((a, b) => d3.ascending(a.y, b.y));

        this.#updateScales(data);

        // line generator
        let lineGen = d3.line()
            .curve(d3.curveMonotoneX)
            .x(d => this.#scaleX(d.y))   // year
            .y(d => this.#scaleY(d.c));  // count

        // creating a path, joining datum
        // drawing with the line generator
        this.chart.append('path')
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "coral")
            .attr("stroke-width", 3)
            .attr('d', lineGen);

        // Update the axes
        let xAxis = d3.axisBottom(this.#scaleX)
            .tickFormat(d3.format("d"));  // integer, no commas
        let yAxis = d3.axisLeft(this.#scaleY);
        this.axisX.call(xAxis);
        this.axisY.call(yAxis);

    }

    #updateScales(data) {
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        let minYear = d3.min(data, d => d.y);
        let maxYear = d3.max(data, d => d.y);
        let maxCount = d3.max(data, d => d.c);
        let minCount = d3.min(data, d => d.c);


        this.#scaleX = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([0, this.chartWidth]);

        this.#scaleY = d3.scaleLinear()
            .domain([minCount, maxCount])
            .range([this.chartHeight, 0]);

    }
}
