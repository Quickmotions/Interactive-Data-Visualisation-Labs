'use strict';

import DataManager from './DataManager.js';
import BarChart from './BarChart.js';
import BubbleChart from './BubbleChart.js';
import LineChart from './LineChart.js';
import DonutChart from './DonutChart.js';

const dataPaths = {
    table1: "data/RenewableAndWasteDirectEnergyUse.csv",
    table2: "data/RenewableAndWasteReallocatedEnergyUse.csv",
    table3: "data/RenewableAndWasteSourcesEnergyUse.csv"
};


async function init() {
    const dataManager = new DataManager(dataPaths);

    // optional: listen when data is loaded
    dataManager.onDataLoaded(() => {
        console.log("Data loaded!");

        // console.log(dataManager.sourcesEnergyUse)

        const data1 = dataManager.getEnergyTablebySource('Solar Photovoltaic');
        let barchart1 = new BarChart('div#bar1', [20, 20, 100, 30]);
        barchart1.render(data1);

        const data2 = dataManager.getDirectIndustryTableOnYear(2023);
        let barchart2 = new BarChart('div#bar2', [20, 20, 100, 30]);
        barchart2.render(data2);

    });

    await dataManager.loadData();
}


// let data1 = [{ industry: 'catA', amount: 23 }, { industry: 'catB', amount: 54 }, { industry: 'catC', amount: 98 }, { industry: 'catD', amount: 37 }];

// let barchart1 = new BarChart('div#bar1', [30, 20, 30, 10]);
// let barchart2 = new BarChart('div#bar2', [30, 20, 30, 10]);
// let bubblechart = new BubbleChart('div#bubble1', 600, 300, [30, 30, 30, 30]);

// let data1 = [{ k: 'key1', v: 400 }, { k: 'key2', v: 300 }, { k: 'key3', v: 200 }];
// barchart1.render(data1);
// barchart1.enableAutoResize();
// barchart2.render(data2);
// barchart2.enableAutoResize();
// bubblechart.render(data2);
// bubblechart.enableBrush();

init();
