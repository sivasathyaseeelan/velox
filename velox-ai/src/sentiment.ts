import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const CONFIG = {
    INFURA_URL: "https://sepolia.infura.io/v3/YOUR-CONTRACT-KEY",
    PRIVATE_KEY: process.env.PRIVATE_KEY || "YOUR-PRIVATE-KEY",
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "YOUR-CONTRACT-ADDRESS",
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    SENTIMENT_THRESHOLD:  0.6,
    MAX_RETRIES:  3,
    RETRY_DELAY:  1000,
    HUGGINGFACE_MODEL: "finiteautomata/bertweet-base-sentiment-analysis",
};

console.log(CONFIG)

interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
}
interface SentimentResponse {
    label: string;
    score: number;
}

export class SentimentAnalysisAgent {
    private tokenMapping: Map<string, TokenInfo>;
    private headers: { Authorization: string };

    constructor() {
        this.tokenMapping = new Map();
        this.headers = {
            Authorization: `Bearer ${CONFIG.HUGGINGFACE_API_KEY}`
        };
    }

    async addToken(symbol: string, name: string) {
        const address = symbol.toLowerCase();
        // console.log(address)
        this.tokenMapping.set(address, { address, symbol, name });
    }
    private async getNewsForToken(tokenInfo: TokenInfo): Promise<string[]> {
        try {
            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: `${tokenInfo.name} ${tokenInfo.symbol} crypto`,
                    apiKey: CONFIG.NEWS_API_KEY,
                    language: 'en',
                    sortBy: 'publishedAt',
                    pageSize: 10
                }
            });

            return response.data.articles.map((article: any) =>
                `${article.title}. ${article.description}`
            );
        } catch (error) {
            console.error(`Error fetching news for ${tokenInfo.symbol}:`, error);
            return [];
        }
    }
    private async analyzeSingleText(text: string): Promise<number> {
        try {
            const response = await axios.post(
                `https://api-inference.huggingface.co/models/${CONFIG.HUGGINGFACE_MODEL}`,
                { inputs: text },
                { headers: this.headers }
            );

            const results: SentimentResponse[] = response.data[0];

            const sentimentMap: { [key: string]: number } = {
                'POS': 1,
                'NEU': 0.5,
                'NEG': 0
            };

            const highestSentiment = results.reduce((prev, current) =>
                prev.score > current.score ? prev : current
            );

            return sentimentMap[highestSentiment.label] || 0.5;
        } catch (error) {
            console.error("Error in sentiment analysis:", error);
            return 0.5;
        }
    }
    private async batchAnalyzeSentiment(texts: string[]): Promise<number> {
        if (!texts.length) return 0.5;

        try {
            const sentiments = await Promise.all(
                texts.map(text => this.analyzeSingleText(text))
            );

            const totalWeight = texts.reduce((sum, text) => sum + text.length, 0);
            const weightedSum = sentiments.reduce(
                (sum, sentiment, index) => sum + (sentiment * texts[index].length),
                0
            );

            return weightedSum / totalWeight;
        } catch (error) {
            console.error("Error in batch sentiment analysis:", error);
            return 0.5;
        }
    }
    async analyzeTokenSentiment(tokenAddress: string): Promise<number> {
        const tokenInfo = this.tokenMapping.get(tokenAddress);
        if (!tokenInfo) {
            console.warn(`No token info found for address ${tokenAddress}`);
            return 0.5;
        }

        const news = await this.getNewsForToken(tokenInfo);
        if (news.length === 0) {
            console.warn(`No news found for token ${tokenInfo.symbol}`);
            return 0.5;
        }

        return await this.batchAnalyzeSentiment(news);
    }

}