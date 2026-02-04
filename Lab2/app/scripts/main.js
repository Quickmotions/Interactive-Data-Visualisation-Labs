'use strict';

import BarChart from './BarChart.js';
import BubbleChart from './BubbleChart.js';

let dogs = [{ breed: 'Golden Retriever', count: 8653, weight: 39.5, height: 56 },
{ breed: 'Alaskan Malamute', count: 261, weight: 36, height: 61 },
{ breed: 'Newfoundland', count: 577, weight: 67.5, height: 68.5 },
{ breed: 'Siberian Husky', count: 391, weight: 21.5, height: 55.5 },
{ breed: 'Shiba Inu', count: 434, weight: 9, height: 38 },
{ breed: 'Keeshond', count: 82, weight: 17.5, height: 44 },
{ breed: 'Australian Shepherd', count: 255, weight: 24, height: 52 },
{ breed: 'Border Collie', count: 1718, weight: 16, height: 51 },
{ breed: 'German Shepherd', count: 7067, weight: 31, height: 60 },
{ breed: 'Swiss Shepherd', count: 110, weight: 32.5, height: 60.5 }]

let data1 = [{ k: 'key1', v: 400 }, { k: 'key2', v: 300 }, { k: 'key3', v: 200 }];
let data2 = [{ k: 'catA', v: 63 }, { k: 'catB', v: 54 }, { k: 'catC', v: 98 }, { k: 'catD', v: 87 }];

let barchart1 = new BarChart('div#bar1', 800, 500);
// let barchart2 = new BarChart('div#bar2', 600, 400);
let bubblechart = new BubbleChart('div#bubble1', 800, 400);

barchart1.render(data1);
// barchart2.render(data2);
bubblechart.render(data2);