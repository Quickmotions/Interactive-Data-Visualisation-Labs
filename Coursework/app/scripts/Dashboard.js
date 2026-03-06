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

        // preprocess data
        this.industryYearsDirect = d3.group(this.industryDirect, d => d.Year);
        this.industryYearsReallocated = d3.group(this.industryReallocated, d => d.Year);
        this.sourcesYear = d3.group(this.sources, d => d.Year);

        // state
        this.currentYear = options.initialYear || 2023;
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
    }

    render() {
        let yearRecord = this.currentYearTable.get(this.currentYear)?.[0];
        let sourcesRecord = this.sourcesYear.get(this.currentYear)?.[0];

        this.yearChart.render(this.removeTotal(yearRecord));
        console.log(sourcesRecord);
        this.sourcesChart.render(sourcesRecord);

        if (this.label) {
            this.label.textContent = this.currentYear;
        }
    }

    removeTotal(record) {
        return Object.fromEntries(
            Object.entries(record)
                .filter(([key]) => key.toLowerCase() !== "total")
        );
    }
}