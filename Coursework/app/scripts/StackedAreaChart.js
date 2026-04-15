export default class StackedAreaChart {
    #scaleX;
    #scaleY;

    constructor(container, margin) {
        this.container = d3.select(container);
        this.margin = margin;
        this.width = 0;
        this.height = 0;

        this.seriesData = []; // [{ id, data }]
        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        this.svg = d3.select(container)
            .append('svg')
            .classed('stacked-area-chart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);

        this.axisX = this.svg.append('g');
        this.axisY = this.svg.append('g');
    }

    addSeries(dataArray) {
        this.seriesData.push({
            id: `series-${this.seriesData.length}`,
            data: this.#formatSeries(dataArray)
        });

        this.render();
    }

    render() {
        this.#resize();

        const allData = this.seriesData.flatMap(d => d.data);

        if (allData.length === 0) return;

        const xValues = [...new Set(allData.map(d => d.x))];

        // --- RESHAPE DATA FOR STACK ---
        const stackedInput = xValues.map(x => {
            const obj = { x };
            this.seriesData.forEach(series => {
                const point = series.data.find(d => d.x === x);
                obj[series.id] = point ? point.y : 0;
            });
            return obj;
        });

        const keys = this.seriesData.map(d => d.id);

        const stack = d3.stack().keys(keys);
        const stackedSeries = stack(stackedInput);

        // --- UPDATE SCALES ---
        this.#updateScales(xValues, stackedSeries);

        // --- AREA GENERATOR ---
        const area = d3.area()
            .x((d, i) => this.#scaleX(xValues[i]))
            .y0(d => this.#scaleY(d[0]))
            .y1(d => this.#scaleY(d[1]));

        // --- DRAW STACKED AREAS ---
        this.chart.selectAll('.area')
            .data(stackedSeries, d => d.key)
            .join('path')
            .attr('class', 'area')
            .attr('fill', (d, i) => this.color(i))
            .attr('d', area);

        // Optional: top boundary lines
        const line = d3.line()
            .x((d, i) => this.#scaleX(xValues[i]))
            .y(d => this.#scaleY(d[1]));

        this.chart.selectAll('.area-line')
            .data(stackedSeries, d => d.key)
            .join('path')
            .attr('class', 'area-line')
            .attr('fill', 'none')
            .attr('stroke', (d, i) => this.color(i))
            .attr('stroke-width', 1.5)
            .attr('d', line);

        this.axisX.call(d3.axisBottom(this.#scaleX));
        this.axisY.call(d3.axisLeft(this.#scaleY));
    }

    enableAutoResize() {
        const observer = new ResizeObserver(() => {
            this.render();
        });
        observer.observe(this.container.node());
    }

    clear() {
        this.seriesData = [];
        this.render();
    }

    #updateScales(xValues, stackedSeries) {
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        this.#scaleX = d3.scalePoint()
            .domain(xValues)
            .range([0, this.chartWidth]);

        this.#scaleY = d3.scaleLinear()
            .domain([
                0,
                d3.max(stackedSeries, s => d3.max(s, d => d[1]))
            ])
            .range([this.chartHeight, 0]);
    }

    #formatSeries(dataArray) {
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