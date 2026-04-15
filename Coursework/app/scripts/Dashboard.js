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
        this.yearChart = options.industriesChart; // bar chart
        this.yearChart.setFixedScales(0, 8); // easier to see changes when fixed

        this.industriesComparisionChart = options.industriesComparison;
        this.sourcesLineChart = options.sourcesLine;

        this.sourcesBubbleChart = options.sourcesBubble;
        this.sourcesBubbleChart.enableZoom();
        this.donutChart = options.donutChart;

        this.renewableDemandChart = options.renewableDemandLine;

        this.industryUsageChart = options.stackedIndustries;

        // preprocess data
        this.industryYearsDirect = d3.group(this.industryDirect, d => d.Year);
        this.industryYearsReallocated = d3.group(this.industryReallocated, d => d.Year);
        this.sourcesYear = d3.group(this.sources, d => d.Year);
        this.donutChartYear = d3.group(this.sources, d => d.Year);

        // state
        this.currentYear = options.initialYear;
        this.currentYearTable = this.industryYearsDirect;
        this.currentIndustryTable = this.industryDirect;

        this.#bindEvents();
        this.render();
    }

    #bindEvents() {

        this.slider.addEventListener("input", () => {
            this.currentYear = +this.slider.value;
            this.update();
        });

        document.getElementById("changeYearTableDirect")
            ?.addEventListener("click", () => {
                this.currentYearTable = this.industryYearsDirect;
                this.currentIndustryTable = this.industryDirect;
                this.update();
            });

        document.getElementById("changeYearTableReallocated")
            ?.addEventListener("click", () => {
                this.currentYearTable = this.industryYearsReallocated;
                this.currentIndustryTable = this.industryReallocated
                this.update();
            });

        this.sourcesBubbleChart.onClick(bubbleData => {
            this.currentYear = +bubbleData.source;
            this.slider.value = this.currentYear;
            this.update();
        });
        this.yearChart.onClick(output => {
            const directData = this.#getValueByKey(this.industryDirect, output.k);
            const reallocatedData = this.#getValueByKey(this.industryReallocated, output.k);

            this.industriesComparisionChart.clear();
            this.industriesComparisionChart.addLine(directData);
            this.industriesComparisionChart.addLine(reallocatedData);
        });
    }

    render() {


        this.renewableDemandChart.clear()
        this.renewableDemandChart.addLine(this.#getValueByKey(this.sources, "EnergyFromRenewableWasteSources"));
        this.renewableDemandChart.addLine(this.#getValueByKey(this.sources, "TotalEnergyConsumptionPrimaryFuels"));
        this.#renderIndustryUsageStackedChart();

        this.update()

    }

    update() {
        let yearRecord = this.currentYearTable.get(this.currentYear)?.[0];

        this.yearChart.render(this.#removeTotal(yearRecord));
        this.sourcesBubbleChart.render(this.#formatBubbleData(this.sourcesYear));
        this.donutChart.render(this.#formatDonutRecord(yearRecord));
        this.industriesComparisionChart.render()
        this.#rendersourcesLineChart();

        if (this.label) {
            this.label.textContent = this.currentYear; // visual year indicator
        }
    }

    #rendersourcesLineChart() {
        this.sourcesLineChart.clear();

        const firstEntry = this.currentIndustryTable[0];
        for (const key in firstEntry) {
            if (key === "Year" || key === "Total") continue;
            this.sourcesLineChart.addLine(
                this.#getValueByKey(this.currentIndustryTable, key)
            );
        }
    }

    #removeTotal(record) {
        return Object.fromEntries(
            Object.entries(record)
                .filter(([key]) => key.toLowerCase() !== "total")
        );
    }

    #getValueByYear(data, year, key) {
        const entry = data.find(d => d.Year === year);
        return entry ? entry[key] : undefined;
    }

    #getValueByKey(data, key) {

        return data.map(d => ({
            year: d.Year,
            value: d[key]
        }));
    }

    #getYearData(data, year) {
        return data.find(d => d.Year === year);
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

    #renderIndustryUsageStackedChart() {
        this.industryUsageChart.clear();

        const industries = Object.keys(this.currentIndustryTable[0])
            .filter(key => key !== 'Year' && key !== 'Total');

        industries.forEach(industry => {
            const series = this.currentIndustryTable.map(d => ({
                year: d.Year,
                value: d[industry]
            }));

            this.industryUsageChart.addSeries(series);
        });
    }
}