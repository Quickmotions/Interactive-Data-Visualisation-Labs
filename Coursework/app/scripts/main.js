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
        industriesChart: new BarChart('div#industries-graph', [30, 50, 150, 10]),
        industriesComparison: new LineChart('div#industries-comparision-graph', [40, 45, 40, 40]),
        sourcesBubble: new BubbleChart('div#bubble1', [30, 50, 60, 30]),
        donutChart: new DonutChart('div#donut1', [0, 0, 0, 0]),
        renewableDemandLine: new LineChart('div#demand-graph', [40, 45, 40, 40]),
        stackedSources: new StackedAreaChart('div#sources-stack-graph', [30, 45, 40, 30]),
        initialYear: 2023
    });

});