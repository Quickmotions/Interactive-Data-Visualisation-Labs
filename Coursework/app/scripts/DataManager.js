export default class DataManager {

    constructor(paths) {
        this.paths = paths;

        this.industryEnergyUseDirect = [];
        this.industryEnergyUseReallocated = [];
        this.sourcesEnergyUse = [];
        this.listeners = [];
    }

    async loadData() {
        try {
            const t1 = await d3.csv(this.paths.table1);
            const t2 = await d3.csv(this.paths.table2);
            const t3 = await d3.csv(this.paths.table3);

            this.industryEnergyUseDirect = this.parseTable(t1);
            this.industryEnergyUseReallocated = this.parseTable(t2);
            this.sourcesEnergyUse = this.parseTable(t3);

            this.notify();
        } catch (err) {
            console.error("Error loading CSV files:", err);
        }
    }

    parseTable(data) {
        return data.map(row => {
            const parsed = {};

            Object.keys(row).forEach(key => {
                const value = row[key];

                if (value === "" || value == null) {
                    parsed[key] = null;
                } else if (value === "[low]") {
                    parsed[key] = 0
                } else if (!isNaN(value)) {
                    parsed[key] = +value;
                } else {
                    parsed[key] = value;
                }
            });

            return parsed;
        });
    }

    onDataLoaded(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb());
    }

    getEnergyTable() {
        return this.sourcesEnergyUse;
    }
    getDirectIndustryTable() {
        return this.industryEnergyUseDirect;
    }
    getReallocatedIndustryTable() {
        return this.industryEnergyUseReallocated;
    }

    getDirectIndustryTableOnYear(year) {
        const record = this.industryEnergyUseDirect.find(d => d.Industry === year);
        if (!record) return [];

        return Object.entries(record)
            .filter(([key, value]) =>
                key !== 'Industry' &&
                key !== 'Total' &&
                key !== 'Consumer expenditure' &&
                key !== 'Households' &&
                value !== null &&
                typeof value === 'number'
            )
            .map(([key, value]) => ({
                k: key,
                v: value
            }));
    }

    getEnergyTablebySource(source) {
        if (!source || typeof source !== 'string') return [];
        if (!this.sourcesEnergyUse || this.sourcesEnergyUse.length === 0) return [];

        const normalize = s => String(s)
            .trim()
            .toLowerCase()
            .replace(/[^0-9a-z]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const target = normalize(source);

        const first = this.sourcesEnergyUse[0];
        let actualKey = null;
        for (const key of Object.keys(first)) {
            if (key === 'Source') continue;
            if (normalize(key) === target) {
                actualKey = key;
                break;
            }
        }
        if (!actualKey) return [];

        const table = this.sourcesEnergyUse
            .map(row => ({ k: row.Source, v: row[actualKey] }))
            .filter(({ k, v }) => k != null && v != null && typeof v === 'number');

        return table.sort((a, b) => a.k - b.k);
    }

}