export default class Dashboard {

    constructor(options) {
        // datasets
        this.industryDirect = options.industryDirect;
        this.industryReallocated = options.industryReallocated;
        this.sources = options.sources;

        // html controls
        this.slider = document.getElementById(options.sliderId);
        this.label = document.getElementById(options.labelId);

        // chart instances
        this.yearChart = options.yearChart; // bar chart
        this.yearChart.setFixedScales(0, 10); // easier to see changes when fixed

        this.sourcesChart = options.sourcesChart; // bubble chart
        this.sourcesChart.enableZoom();

        this.donutChart = options.donutChart;

        // preprocess data
        this.industryYearsDirect = d3.group(this.industryDirect, d => d.Year);
        this.industryYearsReallocated = d3.group(this.industryReallocated, d => d.Year);
        this.sourcesYear = d3.group(this.sources, d => d.Year);
        this.donutChartYear = d3.group(this.sources, d => d.Year);

        // state
        this.currentYear = options.initialYear;
        this.currentYearTable = this.industryYearsDirect;

        this.#bindEvents();
        this.render();
    }

    #bindEvents() {

        this.slider.addEventListener("input", () => {
            this.currentYear = +this.slider.value;
            this.render();
        });

        document.getElementById("changeYearTableDirect")
            ?.addEventListener("click", () => {
                this.currentYearTable = this.industryYearsDirect;
                this.render();
            });

        document.getElementById("changeYearTableReallocated")
            ?.addEventListener("click", () => {
                this.currentYearTable = this.industryYearsReallocated;
                this.render();
            });

        this.sourcesChart.onClick(bubbleData => {
            this.currentYear = +bubbleData.source;
            this.slider.value = this.currentYear;
            this.render();
        });
    }

    render() {
        let yearRecord = this.currentYearTable.get(this.currentYear)?.[0];

        this.yearChart.render(this.#removeTotal(yearRecord));
        this.sourcesChart.render(this.#formatBubbleData(this.sourcesYear));
        this.donutChart.render(this.#formatDonutRecord(yearRecord));

        if (this.label) {
            this.label.textContent = this.currentYear; // visual year indicator
        }
    }

    #removeTotal(record) {
        return Object.fromEntries(
            Object.entries(record)
                .filter(([key]) => key.toLowerCase() !== "total")
        );
    }

    #formatBubbleData(dataset) {
        let bubbleAnalysis = [];

        const years = Array.from(dataset.keys()).sort();

        years.forEach((year, index) => {
            const yearArray = dataset.get(year);
            if (!yearArray?.length) return;

            const data = yearArray[0];

            bubbleAnalysis.push({
                source: year,
                x: index,
                y: data.PercentageFromRenewableSources,
                size: data.TotalEnergyConsumptionPrimaryFuels
            });
        });

        return bubbleAnalysis;
    }

    #formatDonutRecord(record) {
        const excludedKeys = new Set([
            "Year",
            "Total"
        ]);

        let entries = Object.entries(record)
            .filter(([key, value]) =>
                !excludedKeys.has(key) &&
                typeof value === "number" &&
                value > 0
            )
            .map(([key, value]) => ({ key, value }));

        entries = d3.sort(entries, d => -d.value);

        // split top 3 industries and other
        const topEntries = entries.slice(0, 3);
        const otherEntries = entries.slice(3);
        const otherSum = d3.sum(otherEntries, d => d.value);

        const donutAnalysis = {};
        topEntries.forEach(d => {
            donutAnalysis[d.key] = d.value;
        });
        if (otherSum > 0) {
            donutAnalysis["Other"] = otherSum;
        }
        return donutAnalysis;
    }

}