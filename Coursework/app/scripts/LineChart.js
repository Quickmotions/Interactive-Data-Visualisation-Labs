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

        // comparision Hover
        this.hoverGroup = this.chart.append('g')
            .style('display', 'none');

        this.hoverLine = this.hoverGroup.append('line')
            .attr('stroke', 'grey')
            .attr('stroke-dasharray', '4');

        this.diffLine = this.hoverGroup.append('line')
            .attr('stroke', 'red')
            .attr('stroke-width', 2);

        this.diffLabel = this.hoverGroup.append('text')
            .attr('fill', 'red')
            .attr('font-size', 12)
            .attr('text-anchor', 'start');

    }

    addLine(dataArray, labelText = "") {
        this.linesData.push({
            id: `line-${this.linesData.length}`,
            label: labelText,
            data: this.#formatLine(dataArray)
        });

        this.render();
    }

    render() {
        this.#resize();

        const allData = this.linesData.flatMap(d => d.data);
        this.#updateScales(allData);

        // Line generator
        const lineGen = d3.line()
            .x(d => this.#scaleX(d.x))
            .y(d => this.#scaleY(d.y));

        // line renderer
        this.chart.selectAll('.line-path')
            .data(this.linesData, d => d.id)
            .join('path')
            .attr('class', 'line-path')
            .attr('fill', 'none')
            .attr('stroke', d => this.color(d.id))
            .attr('stroke-width', 2)
            .attr('d', d => lineGen(d.data));

        // Hover Overlay
        this.chart.selectAll('.overlay')
            .data([null])
            .join('rect')
            .attr('class', 'overlay')
            .attr('width', this.chartWidth)
            .attr('height', this.chartHeight)
            .attr('fill', 'transparent')
            .on('mousemove', (event) => this.#handleHover(event))
            .on('mouseleave', () => {
                this.hoverGroup.style('display', 'none');
            });

        // Line Labels
        let order = -40
        this.chart.selectAll('.line-label')
            .data(this.linesData, d => d.id)
            .join('text')
            .attr('class', 'line-label')
            .attr('x', 10)
            .attr('y', d => {
                order += 20;
                return order;
            })
            .attr('fill', d => this.color(d.id))
            .attr('font-size', 12)
            .attr('alignment-baseline', 'middle')
            .text(d => d.label || d.id);

        // x axis spacing
        let ticks = this.#scaleX.domain();
        if (this.xTickInterval) {
            ticks = ticks.filter((d, i) => i % this.xTickInterval === 0);
        }
        this.axisX.call(
            d3.axisBottom(this.#scaleX)
                .tickValues(ticks)

        );
        // y axis spacing
        let yAxis = d3.axisLeft(this.#scaleY);
        if (this.yTickInterval) {
            yAxis = yAxis.ticks(this.yTickInterval);
        }
        this.axisY.call(yAxis);
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

    addXLabel(labelText) {
        this.svg.selectAll('.x-axis-label').data([null]).join('text')
            .attr('class', 'x-axis-label')
            .attr('x', this.margin[2] + this.chartWidth / 2)
            .attr('y', this.height - 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(labelText);
    }


    addYLabel(labelText) {
        this.svg.selectAll('.y-axis-label').data([null]).join('text')
            .attr('class', 'y-axis-label')
            .attr("transform", "rotate(-90)") // Rotate -90 degrees
            .attr('x', 0 - labelText.length * 6)
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(labelText);
    }

    setXAxisTickInterval(step = 5) {
        this.xTickInterval = step;
        this.render();
    }
    setYAxisTickInterval(step = 5) {
        this.yTickInterval = step;
        this.render();
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
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);
    }

    #handleHover(event) {
        const [mx] = d3.pointer(event);

        const xDomain = this.#scaleX.domain();

        // cancel pop up if lines empty
        if (!xDomain || xDomain.length === 0) return;

        // Find nearest x value
        const nearestX = xDomain.reduce((a, b) => {
            return Math.abs(this.#scaleX(a) - mx) <
                Math.abs(this.#scaleX(b) - mx) ? a : b;
        });

        // Get y values for each line at this x
        const points = this.linesData.map(line => {
            const point = line.data.find(d => d.x === nearestX);
            if (!point) return null;

            return {
                id: line.id,
                x: nearestX,
                y: point.y
            };
        }).filter(Boolean);

        if (points.length < 2) return;

        // Sort by y value
        points.sort((a, b) => a.y - b.y);

        // Find closest pair
        let minDiff = Infinity;
        let pair = null;

        for (let i = 0; i < points.length - 1; i++) {
            const diff = Math.abs(points[i].y - points[i + 1].y);
            if (diff < minDiff) {
                minDiff = diff;
                pair = [points[i], points[i + 1]];
            }
        }

        if (!pair) return;

        const xPos = this.#scaleX(nearestX);
        const y1 = this.#scaleY(pair[0].y);
        const y2 = this.#scaleY(pair[1].y);

        // Show hover visuals
        this.hoverGroup.style('display', null);

        // Vertical guide line
        this.hoverLine
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', 0)
            .attr('y2', this.chartHeight);

        // Difference line
        this.diffLine
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', y1)
            .attr('y2', y2);

        // Label
        this.diffLabel
            .attr('x', xPos + 5)
            .attr('y', (y1 + y2) / 2)
            .text(`${minDiff.toFixed(1)} MToE`);
    }
}
