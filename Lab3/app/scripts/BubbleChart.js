// Lab 3 Adding Scales

/*
  - container: DOM selector
  - width: visualisation width
  - height: visualisation height
  - margin: chart area margins [top, bottom, left, right]
*/
export default class BubbleChart {
    #scaleX;
    #scaleY;
    #scaleR;

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
        this.data = data.map((d, i) => ({
            k: d.k,
            x: i,     // horizontal placement
            y: 0,     // single row
            r: +d.v   // bubble size
        })); // transform the data into the format we need for the bubble chart

        this.#updateScales();

        this.chart
            .selectAll('circle')
            .data(this.data, d => d.k)
            .join('circle')
            .attr('cx', d => this.#scaleX(d.x))
            .attr('cy', d => this.#scaleY(d.y))
            .attr('r', d => this.#scaleR(d.r));

    }

    #updateScales() {
        // Update scales here
        let chartWidth = this.width - this.margin[2] - this.margin[3],
            chartHeight = this.height - this.margin[0] - this.margin[1];

        let maxR = this.width / this.data.length / 2 - 5; // gap of 5px between bubbles
        let rangeX = [maxR, chartWidth - maxR], // we want to leave some space on the right for the largest bubble
            rangeY = [chartHeight, 0],
            rangeR = [5, maxR]; // we want the largest bubble to be at most half the height of the chart

        let domainX = [Math.min(0, d3.min(this.data, d => d.x)), d3.max(this.data, d => d.x)], // we want to start at 0, even if the data has negative values
            domainY = [Math.min(0, d3.min(this.data, d => d.y)), d3.max(this.data, d => d.y)],
            domainR = [0, d3.max(this.data, d => d.r)];

        this.#scaleX = d3.scaleLinear(domainX, rangeX);
        this.#scaleY = d3.scaleLinear(domainY, rangeY);
        this.#scaleR = d3.scaleSqrt(domainR, rangeR);
    }

}
