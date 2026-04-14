export default class LineChart {
    #scaleX;
    #scaleY;

    constructor(container, margin) {
        this.container = d3.select(container);
        this.margin = margin;
        this.width = 0;
        this.height = 0;

        this.linesData = []; // [{ id, data }]
        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        this.svg = d3.select(container)
            .append('svg')
            .classed('linechart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);

        this.axisX = this.svg.append('g');
        this.axisY = this.svg.append('g');

        // Line generator
        this.line = d3.line()
            .x(d => this.#scaleX(d.x))
            .y(d => this.#scaleY(d.y));
    }

    addLine(dataArray) {
        this.linesData.push({
            id: `line-${this.linesData.length}`,
            data: this.#formatLine(dataArray)
        });

        this.render();
    }

    render() {
        this.#resize();

        const allData = this.linesData.flatMap(d => d.data);
        this.#updateScales(allData);

        // LINE GENERATOR (updated each render)
        const lineGen = d3.line()
            .x(d => this.#scaleX(d.x))
            .y(d => this.#scaleY(d.y));

        // DRAW LINES
        this.chart.selectAll('.line-path')
            .data(this.linesData, d => d.id)
            .join('path')
            .attr('class', 'line-path')
            .attr('fill', 'none')
            .attr('stroke', d => this.color(d.id))
            .attr('stroke-width', 2)
            .attr('d', d => lineGen(d.data));

        this.axisX.call(d3.axisBottom(this.#scaleX));
        this.axisY.call(d3.axisLeft(this.#scaleY));
    }

    enableAutoResize(data) {
        const observer = new ResizeObserver(() => {
            this.render(data);
        });
        observer.observe(this.container.node());
    }

    clear() {
        this.linesData = [];
        this.render();
    }

    onClick(callback) {
        this.clickCallback = callback;
    }

    #updateScales(allData) {
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        this.#scaleX = d3.scalePoint()
            .domain([...new Set(allData.map(d => d.x))])
            .range([0, this.chartWidth]);

        this.#scaleY = d3.scaleLinear()
            .domain([
                0,
                d3.max(allData, d => d.y)
            ])
            .range([this.chartHeight, 0]);
    }

    #formatLine(dataArray) {
        return dataArray.map(d => ({
            x: d.year,
            y: d.value
        }));
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

}
