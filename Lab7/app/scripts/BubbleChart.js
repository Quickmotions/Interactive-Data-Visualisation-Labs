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

        // Behaviour flag (false by default)
        this.behaviour = false;


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

        this.bubbleGroup = this.chart.append('g');
    }

    render(data) {
        this.#updateScales(data);
        // this.bubbles = this.bubbleGroup.selectAll('circle.bubble')

        // Update the circles
        this.bubbleGroup
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

    // Private method to configure zoom behaviour
    #setZoom() {
        const zoom = d3.zoom()
            .scaleExtent([1, 5])
            .on('zoom', ({ transform }) => {
                // Move and scale bubbles
                this.bubbleGroup.attr('transform', transform);

                this.axisX.attr(
                    'transform',
                    `translate(${this.margin[2] + transform.x}, ${this.height - this.margin[1]}) scale(${transform.k}, 1)`
                );
            });

        this.svg.call(zoom);
    }

    // Private method to configure brush behaviour
    #setBrush() {
        const brush = d3.brush()
            .extent([[0, 0], [this.chartWidth, this.chartHeight]])
            .on('brush end', ({ selection }) => {

                if (!selection) {
                    // If brush is cleared, reset all bubbles
                    this.bubbleGroup
                        .selectAll('circle')
                        .attr('stroke', null)
                        .attr('stroke-width', null);
                    return;
                }

                const [[x0, y0], [x1, y1]] = selection;

                this.bubbleGroup
                    .selectAll('circle')
                    .attr('stroke', d => {
                        const cx = this.#scaleX(d.k);
                        const cy = this.chartHeight / 2;

                        return (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1)
                            ? 'black'
                            : null;
                    })
                    .attr('stroke-width', d => {
                        const cx = this.#scaleX(d.k);
                        const cy = this.chartHeight / 2;

                        return (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1)
                            ? 2
                            : null;
                    });
            });

        this.chart.call(brush);
    }

    // Public methods to enable behaviours only if no other behaviour is active
    enableZoom() {
        if (!this.behaviour) {
            this.behaviour = true;
            this.#setZoom();
        }
    }
    enableBrush() {
        if (!this.behaviour) {
            this.behaviour = true;
            this.#setBrush();
        }
    }
}
