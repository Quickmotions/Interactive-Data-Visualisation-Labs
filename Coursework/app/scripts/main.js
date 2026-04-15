'use strict';

import DataManager from './DataManager.js';
import Dashboard from './Dashboard.js';
import BarChart from './BarChart.js';
import BubbleChart from './BubbleChart.js';
import DonutChart from './DonutChart.js';
import LineChart from './LineChart.js';
import StackedAreaChart from './StackedAreaChart.js';


const dataPaths = {
    table1: "data/RenewableAndWasteDirectEnergyUse.csv",
    table2: "data/RenewableAndWasteReallocatedEnergyUse.csv",
    table3: "data/RenewableAndWasteSourcesEnergyUse.csv"
};

const dm = new DataManager();

Promise.all([
    dm.loadIndustryTable(dataPaths.table1),
    dm.loadIndustryTable(dataPaths.table2),
    dm.loadSourcesTable(dataPaths.table3)

]).then(([direct, reallocated, sources]) => {

    const dashboard = new Dashboard({
        industryDirect: direct,
        industryReallocated: reallocated,
        sources: sources,
        sliderId: "yearSlider",
        labelId: "yearLabel",
        industriesChart: new BarChart('div#industries-graph', [30, 40, 150, 10]),
        industriesComparison: new LineChart('div#industries-comparision-graph', [30, 40, 40, 30]),
        sourcesBubble: new BubbleChart('div#bubble1', [20, 45, 60, 20]),
        donutChart: new DonutChart('div#donut1', [20, 20, 20, 20]),
        sourcesLine: new LineChart('div#sources-line', [30, 40, 20, 30]),
        renewableDemandLine: new LineChart('div#demand-graph', [40, 40, 40, 40]),
        stackedIndustries: new StackedAreaChart('div#industry-stack-graph', [30, 30, 30, 30]),
        initialYear: 2023
    });

});