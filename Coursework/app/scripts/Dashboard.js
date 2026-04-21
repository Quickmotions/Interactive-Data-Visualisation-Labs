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
        this.donutChart = options.donutChart;

        this.renewableDemandChart = options.renewableDemandLine;

        this.renewableEnergyStackedChart = options.stackedSources;

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
        this.donutChart.onHover(attributeName => {
            this.yearChart.highlightBar(attributeName);
        });

        this.donutChart.onHoverOut(() => {
            this.yearChart.clearHighlight();
        });

        this.yearChart.onClick(output => {
            const directData = this.#getValueByKey(this.industryDirect, output.k);
            const reallocatedData = this.#getValueByKey(this.industryReallocated, output.k);

            this.industriesComparisionChart.clear();
            this.industriesComparisionChart.addLine(directData, `Direct ${output.k}`);
            this.industriesComparisionChart.addLine(reallocatedData, `Reallocated ${output.k}`);
        });
    }

    render() {
        this.industriesComparisionChart.setXAxisTickInterval(3);

        this.renewableDemandChart.clear()
        this.renewableDemandChart.addLine(this.#getValueByKey(this.sources, "TotalEnergyConsumptionPrimaryFuels"), "Total Energy Consumption");
        this.renewableDemandChart.addLine(this.#getValueByKey(this.sources, "EnergyFromRenewableWasteSources"), "Renewable Energy");
        this.renewableDemandChart.addYLabel("Million Tonnes of Oil Equivalent");
        this.renewableDemandChart.setXAxisTickInterval(3);
        this.industriesComparisionChart.addYLabel("Million Tonnes of Oil Equivalent");


        this.#renderRenewablesStackedChart();

        this.update()

    }

    update() {
        let yearRecord = this.currentYearTable.get(this.currentYear)?.[0];

        this.yearChart.render(this.#removeTotal(yearRecord));
        this.donutChart.render(this.#formatDonutRecord(yearRecord));
        this.#renderBubbleChart();

        this.industriesComparisionChart.render()

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

    #getValueByKey(data, key) {

        return data.map(d => ({
            year: d.Year,
            value: d[key]
        }));
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

        // split top 4 industries and other
        const topEntries = entries.slice(0, 4);
        const otherEntries = entries.slice(4);
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

    #renderBubbleChart() {
        const sourcesRecord = this.sourcesYear.get(this.currentYear)?.[0];
        if (!sourcesRecord) return;

        const categories = [
            {
                name: "Non-Combustible",
                fields: [
                    "HydroelectricPower",
                    "WindWaveTidal",
                    "SolarPhotovoltaic",
                    "GeothermalAquifers"
                ]
            },
            {
                name: "Biomass",
                fields: [
                    "AnimalBiomass",
                    "PlantBiomass",
                    "Straw"
                ]
            },
            {
                name: "Wood Fuel",
                fields: [
                    "Wood",
                    "WoodDry",
                    "WoodSeasoned",
                    "WoodWet",
                    "Coffeelogs",
                    "Woodchip",
                    "WoodPellets",
                    "WoodBriquettes",
                    "Charcoal"
                ]
            },
            {
                name: "Biogas",
                fields: [
                    "LandfillGas",
                    "SewageGas",
                    "Biogas"
                ]
            },
            {
                name: "Liquid Biofuel",
                fields: [
                    "LiquidBiofuels",
                    "Bioethanol",
                    "Biodiesel",
                    "SustainableAviationFuel"
                ]
            },
            {
                name: "Waste Fuel",
                fields: [
                    "MunicipalSolidWaste",
                    "NonMunicipalSolidWaste"
                ]
            }
        ];

        const totalEnergy = sourcesRecord.TotalEnergyConsumptionPrimaryFuels ||
            d3.sum(Object.values(sourcesRecord).filter(value => typeof value === 'number'));

        const bubbleData = categories.map((category, index) => {
            const value = d3.sum(category.fields, field => sourcesRecord[field] || 0);
            return {
                source: category.name,
                x: index + 1,
                y: totalEnergy ? value / totalEnergy : 0,
                size: value
            };
        });

        this.sourcesBubbleChart.render(bubbleData);
    }

    #renderRenewablesStackedChart() {
        this.renewableEnergyStackedChart.clear();

        const industries = Object.keys(this.sources[0])
            .filter(key => key !== 'Year' &&
                key !== 'Total' &&
                key !== 'TotalEnergyConsumptionPrimaryFuels' &&
                key !== 'EnergyFromRenewableWasteSources' &&
                key !== 'PercentageFromRenewableSources');

        industries.forEach(industry => {
            const newArea = this.sources.map(d => ({
                year: d.Year,
                value: d[industry]
            }));

            this.renewableEnergyStackedChart.addArea(newArea, industry);
        });
        this.renewableEnergyStackedChart.setXAxisTickInterval(5);
        this.renewableEnergyStackedChart.addYLabel("Million Tonnes of Oil Equivalent")
        this.renewableEnergyStackedChart.addMouseOverTooltip();
        this.renewableEnergyStackedChart.enableZoom();
    }
}