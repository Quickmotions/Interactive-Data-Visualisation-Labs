'use strict';

import BarChart from './BarChart.js';
import BubbleChart from './BubbleChart.js';
import LineChart from './LineChart.js';
import DonutChart from './DonutChart.js';

// data for line chart
let data1 = [
    { x: 80, y: 50 }, { x: 120, y: 120 },
    { x: 160, y: 140 }, { x: 200, y: 90 },
    { x: 240, y: 150 }, { x: 280, y: 50 }]; // sorted already

let grHistoric = [{ y: 2011, c: 8081 }, { y: 2012, c: 7085 }, { y: 2013, c: 7117 }, { y: 2014, c: 6977 }, { y: 2015, c: 6928 }, { y: 2016, c: 7232 }, { y: 2017, c: 7846 }, { y: 2018, c: 7794 }, { y: 2019, c: 8422 }, { y: 2020, c: 8653 }];
// unsorted 

// getting the transformed data for a pie chart
let data2 = [{ k: 'a', v: 2 }, { k: 'b', v: 3 }, { k: 'c', v: 6 }];

let linechart1 = new LineChart('div#line1', 600, 400, [20, 20, 40, 40]);
let donutchart1 = new DonutChart('div#donut1', 500, 500, [40, 40, 40, 40]);

linechart1.render(grHistoric);
donutchart1.render(data2);
