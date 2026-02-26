'use strict';

import BarChart from './BarChart.js';
import BubbleChart from './BubbleChart.js';
import LineChart from './LineChart.js';
import DonutChart from './DonutChart.js';

// data prod
d3.csv('data/sales.csv', d => {
    return {
        location: d.location,                           // unchanged
        client: d.client,                               // unchanged
        salesrep: d.salesrep,                           // unchanged
        paid: d.paid === 'Yes',                         // parsed to bool
        reimbursed: d.reimbursed === 'Yes',             // parsed to bool
        sales: parseInt(d.sales),                       // parsed to int
        expenses: parseInt(d.expenses),                 // parsed to int
        profits: parseInt(d.sales) - parseInt(d.expenses) // new attribute
    }
})
    .then(dataset => {
        // Find the lists of unique Sales Rep, Locations and Clients.
        const uniqueSalesReps = Array.from(new Set(dataset.map(d => d.salesrep))); // map goes through each element and returns elements that match in a new array
        const uniqueLocations = Array.from(new Set(dataset.map(d => d.location))); // set removes duplicates
        const uniqueClients = Array.from(new Set(dataset.map(d => d.client)));
        console.log("Unique Sales Reps:", uniqueSalesReps);
        console.log("Unique Locations:", uniqueLocations);
        console.log("Unique Clients:", uniqueClients);

        // Find the number of sales for which payment has been received.
        const paidSalesCount = dataset.filter(d => d.paid).length; // filter removes untrue values
        console.log("Number of sales with payment received:", paidSalesCount);

        const grouped = d3.group(
            dataset,
            d => d.salesrep,
            d => d.location
        );
        console.log("Grouped entries by sales rep the location", grouped);

        // Group the dataset entries by Client and then Locations and get the number of entries in each group.
        const groupedEntries = d3.rollup(
            dataset,
            v => length,
            d => d.client,
            d => d.location
        );
        console.log("Grouped sales total by client then location", groupedEntries);

        const highestExpense = d3.max(new Set(dataset.map(d => d.expenses)));
        console.log("Highest Expense:", highestExpense);

        const lowestExpense = d3.min(new Set(dataset.map(d => d.expenses)));
        console.log("Lowest Expense:", lowestExpense);

    })


