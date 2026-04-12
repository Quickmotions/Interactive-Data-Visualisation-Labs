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
            .x(d => this.#scaleX(d.k))
            .y(d => this.#scaleY(d.v));
    }

    addLine(dataMap, industry) {
        const formatted = this.#formatIndustryLine(dataMap, industry);

        this.linesData.push({
            id: industry,
            data: formatted
        });

        this.render();
    }

    render() {
        this.#resize();

        const allData = this.linesData.flatMap(d => d.data);
        this.#updateScales(allData);

        // LINE GENERATOR (updated each render)
        const lineGen = d3.line()
            .x(d => this.#scaleX(d.k))
            .y(d => this.#scaleY(d.v));

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

    #updateScales(allData) {
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        this.#scaleX = d3.scalePoint()
            .domain([...new Set(allData.map(d => d.k))])
            .range([0, this.chartWidth]);

        this.#scaleY = d3.scaleLinear()
            .domain([
                0,
                d3.max(allData, d => d.v)
            ])
            .range([this.chartHeight, 0]);
    }

    #formatIndustryLine(dataMap, industry) {
        return Array.from(dataMap.entries())
            .sort((a, b) => a[0] - b[0]) // ensure years are ordered
            .map(([year, arr]) => {
                const record = arr[0]; // your array always has one object
                return {
                    k: +year,                 // x (year)
                    v: record[industry] ?? 0 // y (value for that industry)
                };
            });
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