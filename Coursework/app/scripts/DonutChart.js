// Lab 4 Donut Chart

export default class DonutChart {
    #scaleArc;
    #arcGen;

    constructor(container, margin) {
        this.container = d3.select(container);
        this.margin = margin;
        this.width = 0; // updates on #resize
        this.height = 0;

        // Flags

        //  Containers
        this.svg = d3.select(container)
            .append('svg')
            .classed('donutchart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);

        // Axes
    }

    render(data) {
        data = this.#formatData(data);
        this.#resize();
        this.#updateScales(data);

        // Maths
        const pieGen = d3.pie()
            .padAngle(0.02)
            .sort(null)
            .value(d => d.v);

        const pieData = pieGen(data);

        // Donut
        this.chart
            .selectAll('path')
            .data(pieData, d => d.data.k)
            .join('path')
            .attr('fill', d => this.#scaleArc(d.data.v))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('d', this.#arcGen);

        // Labels
        this.chart
            .selectAll('text')
            .data(pieData, d => d.data.k)
            .join('text')
            .attr('transform', d => `translate(${this.#arcGen.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .style('font-size', '12px')
            .style('fill', '#000000')
            .text(d => d.data.k);
    }

    enableAutoResize(data) {
        const observer = new ResizeObserver(() => {
            this.render(data);
        });

        observer.observe(this.container.node());
    }

    #updateScales(data) {
        // margins and donut angle updates
        const chartWidth = this.width - this.margin[2] - this.margin[3];
        const chartHeight = this.height - this.margin[0] - this.margin[1];

        const radius = Math.min(chartWidth, chartHeight) / 2;
        const minValue = 0;
        const maxValue = d3.max(data, d => d.v);

        this.#scaleArc = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range(["#c3fdec", "#008e63"]);

        this.#arcGen = d3.arc()
            .innerRadius(radius / 2)
            .outerRadius(radius - 5);

        this.chart
            .attr('transform',
                `translate(${this.margin[2] + chartWidth / 2},
                           ${this.margin[0] + chartHeight / 2})`);
    }

    // adapter for new input into older graph from lab 
    #formatData(data) {
        return Object.entries(data)
            .filter(([key]) => key !== "Year")
            .map(([key, value]) => ({
                k: key,
                v: value
            }));
    }

    #resize() {
        const bounds = this.container.node().getBoundingClientRect();

        this.width = bounds.width;
        this.height = bounds.height;

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);
    }

}
