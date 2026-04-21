export default class StackedAreaChart {
    #scaleX;
    #scaleY;

    constructor(container, margin) {
        this.container = d3.select(container);
        this.margin = margin;
        this.width = 0;
        this.height = 0;

        this.areaData = []; // [{ id, data }]
        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        // flags
        this.behaviour = false;

        this.svg = d3.select(container)
            .append('svg')
            .classed('stacked-area-chart', true);

        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[3]}, ${this.margin[0]})`);

        this.axisX = this.svg.append('g');
        this.axisY = this.svg.append('g');

        // tool tip element
        this.tooltip = d3.select(this.container.node())
            .append('div')
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('background', 'rgba(0,0,0,0.7)')
            .style('color', '#fff')
            .style('padding', '6px 8px')
            .style('font-size', '12px')
            .style('border-radius', '4px')
            .style('display', 'none');

    }

    addArea(dataArray, labelText = null) {
        this.areaData.push({
            id: `area-${this.areaData.length}`,
            data: this.#formatArea(dataArray),
            label: labelText
        });

        this.render();
    }

    render() {
        this.#resize();

        const allData = this.areaData.flatMap(d => d.data);

        if (allData.length === 0) return;

        const xValues = [...new Set(allData.map(d => d.x))];
        this.xLabels = xValues;

        // reshape data for stacking
        const stackedInput = xValues.map(x => {
            const obj = { x };
            this.areaData.forEach(area => {
                const point = area.data.find(d => d.x === x);
                obj[area.id] = point ? point.y : 0;
            });
            return obj;
        });

        const keys = this.areaData.map(d => d.id);

        const stack = d3.stack().keys(keys);
        const stackedArea = stack(stackedInput);

        this.#updateScales(xValues, stackedArea);

        // Area Generator
        const area = d3.area()
            .x((d, i) => this.#scaleX(i))
            .y0(d => this.#scaleY(d[0]))
            .y1(d => this.#scaleY(d[1]));

        // render stack areas
        this.chart.selectAll('.area')
            .data(stackedArea, d => d.key)
            .join('path')
            .attr('class', 'area')
            .attr('fill', (d, i) => this.color(i))
            .attr('d', area);

        // boundaries
        const line = d3.line()
            .x((d, i) => this.#scaleX(i))
            .y(d => this.#scaleY(d[1]));

        // line renderer
        this.chart.selectAll('.area-line')
            .data(stackedArea, d => d.key)
            .join('path')
            .attr('class', 'area-line')
            .attr('fill', 'none')
            .attr('stroke', (d, i) => this.color(i))
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // x axis spacing
        let ticks = this.xLabels.map((_, i) => i);
        if (this.xTickInterval) {
            ticks = ticks.filter(i => i % this.xTickInterval === 0);
        }
        this.axisX.call(
            d3.axisBottom(this.#scaleX)
                .tickValues(ticks)
                .tickFormat(d => this.xLabels[Math.round(d)] ?? d)
        );
        // y axis spacing
        let yAxis = d3.axisLeft(this.#scaleY);
        if (this.yTickInterval) {
            yAxis = yAxis.ticks(this.yTickInterval);
        }
        this.axisY.call(yAxis);

    }

    enableAutoResize() {
        const observer = new ResizeObserver(() => {
            this.render();
        });
        observer.observe(this.container.node());
    }

    clear() {
        this.areaData = [];
        this.render();
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

    addMouseOverTooltip() {
        const overlay = this.chart.selectAll('.overlay')
            .data([null])
            .join('rect')
            .attr('class', 'overlay')
            .attr('width', this.chartWidth)
            .attr('height', this.chartHeight)
            .attr('fill', 'transparent');

        const xValues = this.xLabels || [];

        overlay
            .on('mousemove', (event) => {
                const [mouseX, mouseY] = d3.pointer(event);

                if (xValues.length === 0) return;
                const step = this.chartWidth / (xValues.length - 1);
                const index = Math.round(mouseX / step);
                const xVal = xValues[index];

                if (xVal === undefined) return;

                const yValue = this.#scaleY.invert(mouseY);

                let selectedArea = null;
                let selectedValue = null;

                this.chart.selectAll('.area')
                    .attr('opacity', 0.3)
                    .each((d, i, nodes) => {
                        const [y0, y1] = d[index];

                        if (yValue >= y0 && yValue <= y1) {
                            // finding area label from area data objects
                            selectedArea = this.areaData.find(a => a.id === d.key)?.label || d.key;
                            selectedValue = y1 - y0;

                            d3.select(nodes[i]).attr('opacity', 1);
                        }
                    });

                if (!selectedArea) return;

                // tool tip object
                const tooltipWidth = this.tooltip.node().offsetWidth;
                this.tooltip
                    .style('display', 'block')
                    .html(`
                    <strong>${xVal}</strong><br/>
                    ${selectedArea}: ${selectedValue.toFixed(1)}
                `)
                    .style('left', `${event.pageX - tooltipWidth - 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mouseleave', () => {
                this.tooltip.style('display', 'none');
                this.chart.selectAll('.area').attr('opacity', 1);
            });
    }



    #updateScales(xValues, stackedArea) {
        this.chartWidth = this.width - this.margin[2] - this.margin[3];
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        this.#scaleX = d3.scaleLinear()
            .domain([0, Math.max(0, xValues.length - 1)])
            .range([0, this.chartWidth]);

        this.#scaleY = d3.scaleLinear()
            .domain([
                0,
                d3.max(stackedArea, s => d3.max(s, d => d[1]))
            ])
            .range([this.chartHeight, 0]);
    }

    #formatArea(dataArray) {
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

    // enable behaviours only if no other behaviour is active
    enableZoom() {
        if (!this.behaviour) {
            this.behaviour = true;
            this.#setZoom();
        }
    }

    // zoom behaviour
    #setZoom() {
        const zoom = d3.zoom()
            .scaleExtent([1, 20])
            .translateExtent([[0, 0], [this.chartWidth, this.chartHeight]])
            .extent([[0, 0], [this.chartWidth, this.chartHeight]])
            .on('zoom', ({ transform }) => {

                const newX = transform.rescaleX(this.#scaleX);
                const newY = transform.rescaleY(this.#scaleY);

                this.chart.attr('transform', `translate(${this.margin[2]}, ${this.margin[0]}) ${transform}`);

                let zoomTicks = this.xLabels ? this.xLabels.map((_, i) => i) : null;
                if (this.xTickInterval && zoomTicks) {
                    zoomTicks = zoomTicks.filter(i => i % this.xTickInterval === 0);
                }

                this.axisX.call(
                    d3.axisBottom(newX)
                        .tickValues(zoomTicks)
                        .tickFormat(d => this.xLabels?.[Math.round(d)] ?? d)
                );
                this.axisY.call(d3.axisLeft(newY));
            });

        this.svg.call(zoom);
    }

}