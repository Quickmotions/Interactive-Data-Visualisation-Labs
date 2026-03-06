// Lab 3 Adding Scales

export default class BubbleChart {
    #scaleX;
    #scaleY
    #scaleR;
    #scaleColor;

    constructor(container, margin) {
        this.container = d3.select(container);
        this.width = 0; // updates in #resize
        this.height = 0;
        this.margin = margin;

        // flags
        this.behaviour = false;
        this.clickCallback = null;

        // Append the SVG element
        this.svg = d3.select(container)
            .append('svg')
            .classed('bubblechart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);
        this.bubbleGroup = this.chart.append('g');
        // Axes
        this.axisX = this.svg.append('g');
        this.axisY = this.svg.append('g');
    }

    render(data) {
        this.#resize();
        this.#updateScales(data);

        // Bubble
        this.bubbleGroup
            .selectAll('circle')
            .data(data, d => d.source)
            .join('circle')
            .attr('cx', d => this.#scaleX(d.x))
            .attr('cy', d => this.#scaleY(d.y))
            .attr('r', d => this.#scaleR(d.size))
            .attr('fill', d => this.#scaleColor(d.size))
            .on('mouseover', (event, d) => {
                this.bubbleGroup
                    .selectAll('text')
                    .filter(t => t.source === d.source)
                    .style('opacity', 1);
            })
            .on('mouseout', (event, d) => {
                this.bubbleGroup
                    .selectAll('text')
                    .filter(t => t.source === d.source)
                    .style('opacity', 0);
            })
            .on('click', (event, d) => {
                if (this.clickCallback) {
                    this.clickCallback(d);
                }
            });

        // Label
        this.bubbleGroup
            .selectAll('text')
            .data(data, d => d.source)
            .join('text')
            .attr('x', d => this.#scaleX(d.x))
            .attr('y', d => this.#scaleY(d.y))
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .style('font-size', '10px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .text(d => d.source);

        // Axes
        let xAxis = d3.axisBottom(this.#scaleX),
            yAxis = d3.axisLeft(this.#scaleY).tickFormat(d3.format(".0%"));
        this.axisX.call(xAxis);
        this.axisY.call(yAxis);

        // Axes Labels
        this.svg.selectAll('.x-axis-label').data([null]).join('text')
            .attr('class', 'x-axis-label')
            .attr('x', this.margin[2] + this.chartWidth / 2)
            .attr('y', this.height - 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('Renewable energy contribution (Mtoe)');

        this.svg.selectAll('.y-axis-label').data([null]).join('text')
            .attr('class', 'y-axis-label')
            .attr('transform',
                `translate(15, ${this.margin[0] + this.chartHeight / 2}) rotate(-90)`
            )
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('% Renewables');

    }

    #updateScales(data) {
        // Update scales here
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        let maxValue = d3.max(data, d => d.size);
        let maxR = Math.min(this.chartWidth, this.chartHeight) / this.height * 16;

        this.#scaleX = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.x)])
            .nice()
            .range([0, this.chartWidth]);
        this.#scaleY = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)])
            .nice()
            .range([this.chartHeight, 0]);
        this.#scaleR = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([4, maxR]);
        this.#scaleColor = d3.scaleLinear()
            .domain([0, maxValue])
            .range(["#c4d6df", "#066eb3"]);
    }

    enableAutoResize(data) {
        const observer = new ResizeObserver(() => {
            this.render(data);
        });

        observer.observe(this.container.node());
    }

    onClick(callback) {
        this.clickCallback = callback;
    }

    #resize() {
        const bounds = this.container.node().getBoundingClientRect();

        this.width = bounds.width;
        this.height = bounds.height;

        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        this.chart
            .attr('transform', `translate(${this.margin[2]}, ${this.margin[0]})`);

        this.axisX
            .attr('transform', `translate(${this.margin[2]}, ${this.height - this.margin[1]})`);

        this.axisY
            .attr('transform', `translate(${this.margin[2]}, ${this.margin[0]})`);
    }

    // zoom behaviour
    #setZoom() {
        const zoom = d3.zoom()
            .scaleExtent([1, 5])
            .on('zoom', ({ transform }) => {

                // rescaled axes
                const newX = transform.rescaleX(this.#scaleX);
                const newY = transform.rescaleY(this.#scaleY);

                // scale bubbles
                this.bubbleGroup.attr('transform', transform);

                // update axes
                this.axisX.call(d3.axisBottom(newX));
                this.axisY.call(d3.axisLeft(newY).tickFormat(d3.format(".0%")));
            });

        this.svg.call(zoom);
    }

    // enable behaviours only if no other behaviour is active
    enableZoom() {
        if (!this.behaviour) {
            this.behaviour = true;
            this.#setZoom();
        }
    }

}
