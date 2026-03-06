class DataManager {
    constructor() { }

    fixLowValue(value) {
        if (!value || value === "[low]") return 0;

        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    async loadIndustryTable(path = "data/sales.csv") {
        return await d3.csv(path, d => ({
            Year: parseInt(d.Year),

            Agriculture: this.fixLowValue(d.Agriculture),
            Mining: this.fixLowValue(d.Mining),
            Manufacturing: this.fixLowValue(d.Manufacturing),

            ElectricityGas: this.fixLowValue(d["Electricity & Gas"]),
            WaterSupply: this.fixLowValue(d["Water Supply"]),
            Construction: this.fixLowValue(d.Construction),

            RetailVehicles: this.fixLowValue(d["Retail & Vehicles"]),
            TransportStorage: this.fixLowValue(d["Transport & Storage"]),
            AccommodationFoodServices: this.fixLowValue(d["Accommodation & Food Services"]),
            InformationCommunication: this.fixLowValue(d["Information & Communication"]),

            FinancialInsurance: this.fixLowValue(d["Financial & Insurance"]),
            RealEstate: this.fixLowValue(d["Real Estate"]),
            ProfessionalScience: this.fixLowValue(d["Professional & Science"]),

            Administrative: this.fixLowValue(d.Administrative),
            PublicSector: this.fixLowValue(d["Public Sector"]),

            Education: this.fixLowValue(d.Education),
            Health: this.fixLowValue(d.Health),

            ArtsRecreation: this.fixLowValue(d["Arts & Recreation"]),
            OtherServices: this.fixLowValue(d["Other Services"]),
            Households: this.fixLowValue(d.Households),

            ConsumerExpenditure: this.fixLowValue(d["Consumer Expenditure"]),
            Total: this.fixLowValue(d.Total)
        }));
    }
    async loadSourcesTable(path = "data/sales.csv") {
        return await d3.csv(path, d => ({
            Year: parseInt(d.Year),
            HydroelectricPower: this.fixLowValue(d["Hydroelectric Power"]),
            WindWaveTidal: this.fixLowValue(d["Wind Wave Tidal"]),
            SolarPhotovoltaic: this.fixLowValue(d["Solar Photovoltaic"]),
            GeothermalAquifers: this.fixLowValue(d["Geothermal Aquifers"]),

            LandfillGas: this.fixLowValue(d["Landfill Gas"]),
            SewageGas: this.fixLowValue(d["Sewage Gas"]),
            Biogas: this.fixLowValue(d.Biogas),

            MunicipalSolidWaste: this.fixLowValue(d["Municipal Solid Waste"]),
            NonMunicipalSolidWaste: this.fixLowValue(d["Non-Municipal Solid Waste"]),

            AnimalBiomass: this.fixLowValue(d["Animal Biomass"]),
            PlantBiomass: this.fixLowValue(d["Plant Biomass"]),
            Straw: this.fixLowValue(d.Straw),

            Wood: this.fixLowValue(d.Wood),
            WoodDry: this.fixLowValue(d["Wood - Dry"]),
            WoodSeasoned: this.fixLowValue(d["Wood - Seasoned"]),
            WoodWet: this.fixLowValue(d["Wood - Wet"]),

            Coffeelogs: this.fixLowValue(d["Coffee logs"]),
            Woodchip: this.fixLowValue(d.Woodchip),
            WoodPellets: this.fixLowValue(d["Wood Pellets"]),
            WoodBriquettes: this.fixLowValue(d["Wood Briquettes"]),

            Charcoal: this.fixLowValue(d.Charcoal),

            LiquidBiofuels: this.fixLowValue(d["Liquid bio-fuels"]),
            Bioethanol: this.fixLowValue(d.Bioethanol),
            Biodiesel: this.fixLowValue(d.Biodiesel),
            SustainableAviationFuel: this.fixLowValue(d["Sustainable Aviation Fuel"]),

            CrossBoundaryAdjustment: this.fixLowValue(d["Cross-boundary Adjustment"]),
            EnergyFromRenewableWasteSources: this.fixLowValue(d["Energy from Renewable & Waste Sources"]),
            TotalEnergyConsumptionPrimaryFuels: this.fixLowValue(d["Total Energy Consumption of Primary Fuels"]),

            PercentageFromRenewableSources: d["Percentage From Renewable Sources"]
                ? parseFloat(d["Percentage From Renewable Sources"].replace("%", "")) / 100
                : 0
        }));
    }
}
export default DataManager;