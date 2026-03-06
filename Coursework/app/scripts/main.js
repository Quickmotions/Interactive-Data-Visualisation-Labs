'use strict';

import DataManager from './DataManager.js';
import Dashboard from './Dashboard.js';
import BarChart from './BarChart.js';
import BubbleChart from './BubbleChart.js';
import LineChart from './LineChart.js';
import DonutChart from './DonutChart.js';

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
        yearChart: new BarChart('div#bar1', [30, 20, 150, 10]),
        sourcesChart: new BubbleChart('div#bar2', [30, 30, 30, 30]),
        initialYear: 2023
    });

});