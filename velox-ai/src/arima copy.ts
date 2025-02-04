import axios from "axios";
const ARIMA = require('arima')

export class PriceFeedAgent {
    private readonly baseUrl: string = 'https://api.coingecko.com/api/v3/coins';

    // Method to fetch price, volume, and market cap for a given token ticker
    async getTokenData(tokenTicker: string): Promise<{ price: number, volume: number, marketCap: number }> {
        // const url = `${this.baseUrl}/${tokenTicker}/market_chart?vs_currency=usd&days=30`;
        const url = `${this.baseUrl}/${tokenTicker}/market_chart?vs_currency=usd&days=30`;

        try {
            const response = await axios.get(url);

            // Extract price, volume, and market cap data from the API response
            const prices = response.data.prices; // Array of [timestamp, price]
            const volumes = response.data.total_volumes; // Array of [timestamp, volume]
            const marketCaps = response.data.market_caps; // Array of [timestamp, marketCap]

            // Get the latest data (most recent timestamp)
            const latestPriceData = prices[prices.length - 1];
            const latestVolumeData = volumes[volumes.length - 1];
            const latestMarketCapData = marketCaps[marketCaps.length - 1];

            const price = latestPriceData[1];
            const volume = latestVolumeData[1];
            const marketCap = latestMarketCapData[1];

            return { price, volume, marketCap };
        } catch (error) {
            console.error(`Error fetching data for token ${tokenTicker}:`, error);
            throw new Error('Failed to fetch token data');
        }
    }
    // New method to fetch historical data (price, volume, market cap) over the past 30 days
    async getTokenHistory(tokenTicker: string): Promise<{ prices: number[], volumes: number[], marketCaps: number[] }> {
        const url = `${this.baseUrl}/${tokenTicker}/market_chart?vs_currency=usd&days=30`;

        try {
            const response = await axios.get(url);
            // Extract price, volume, and market cap data from the API response
            const prices = response.data.prices; // Array of [timestamp, price]
            const volumes = response.data.total_volumes; // Array of [timestamp, volume]
            const marketCaps = response.data.market_caps; // Array of [timestamp, marketCap]

            // Return the historical data in a structured format
            return {
                prices: prices,  // List of prices sorted by time
                volumes: volumes,  // List of volumes sorted by time
                marketCaps: marketCaps,  // List of market caps sorted by time
            };
        } catch (error) {
            console.error(`Error fetching historical data for token ${tokenTicker}:`, error);
            throw new Error('Failed to fetch token historical data');
        }
    }
}

export class ARIMAPredictionAgent {

    private priceFeedAgent: PriceFeedAgent;  // Instance of PriceFeedAgent to fetch token data
    private arimaConfig: any;  // ARIMA model configuration (adjust as necessary)
    private historicalData: { price: number[], volume: number[], marketCap: number[] };


    constructor(arimaConfig: any) {
        this.priceFeedAgent = new PriceFeedAgent();
        this.arimaConfig = arimaConfig;
        this.historicalData = { price: [], volume: [], marketCap: [] };
    }

    // Method to fetch market data (price, volume, market cap) for a given token using PriceFeedAgent
    async fetchMarketData(tokenTicker: string) {
        try {
            const tokenHistory = await this.priceFeedAgent.getTokenHistory(tokenTicker);  // Fetch historical data

            // Populate historical data arrays for ARIMA prediction
            this.historicalData.price = tokenHistory.prices;
            this.historicalData.volume = tokenHistory.volumes;
            this.historicalData.marketCap = tokenHistory.marketCaps;
        } catch (error) {
            console.error("Error fetching market data for token:", error);
        }
    }

    // Method to get ARIMA predictions for price, volume, and market cap
    async getPrediction(tokenTicker: string) {
        // Fetch historical data before making predictions
        await this.fetchMarketData(tokenTicker);

        // Predict future values using ARIMA if enough historical data is available
        const predictions: { price: number, volume: number, marketCap: number } = { price: 0, volume: 0, marketCap: 0 };

        if (this.historicalData.price.length >= 5) {
            console.log("ARIMA HERE")
            const arimaPrice = new ARIMA({ p: 2, d: 1, q: 2 });  // Example ARIMA config (adjust as needed)
            arimaPrice.fit(this.historicalData.price);
            predictions.price = arimaPrice.predict(1)[0];  // Predict the next price

            const arimaVolume = new ARIMA({ p: 2, d: 1, q: 2 });
            arimaVolume.fit(this.historicalData.volume);
            predictions.volume = arimaVolume.predict(1)[0];  // Predict the next volume

            const arimaMarketCap = new ARIMA({ p: 2, d: 1, q: 2 });
            arimaMarketCap.fit(this.historicalData.marketCap);
            predictions.marketCap = arimaMarketCap.predict(1)[0];  // Predict the next market cap
            console.log("ARIMA END HERE")
        }

        return predictions;  // Return predicted values for price, volume, and market cap
    }
}