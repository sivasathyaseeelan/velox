import { ethers } from "ethers";
import dotenv from 'dotenv';
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import { SentimentAnalysisAgent } from './sentiment';
import { ARIMAPredictionAgent } from './arima';
import { PriceFeedAgent } from './arima';

dotenv.config();

const CONFIG = {
	INFURA_URL: "https://sepolia.infura.io/v3/YOUR-CONTRACT-KEY",
	PRIVATE_KEY: process.env.PRIVATE_KEY || "YOUR-PRIVATE-KEY",
	CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "YOUR-CONTRACT-ADDRESS",
	NEWS_API_KEY: process.env.NEWS_API_KEY,
	GROQ_API_KEY: process.env.GROQ_API_KEY,
	HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
	SENTIMENT_THRESHOLD: 0.6,
	MAX_RETRIES: 3,
	RETRY_DELAY: 1000,
	HUGGINGFACE_MODEL: "finiteautomata/bertweet-base-sentiment-analysis",
};

// ARIMA model configuration (mock data for demonstration)
export const arimaConfig = {
	p: 0.5,  // Autoregressive terms
	d: 1,  // Differencing
	q: 1   // Moving average terms
};

export const TOKENS = {
	"Ethereum": "ETH",
	// "USD Coin": "USDC",
	// "Tether": "USDT",
	// "Chainlink": "LINK",
	"Uniswap": "UNI",
	// "Polygon": "MATIC",
	// "Dai": "DAI",
	// "Aave": "AAVE",
	// "Sushi": "SUSHI",
	// "Maker": "MKR",
	// "Compound": "COMP",
	// "Filecoin": "FIL",
	// "Synthetix": "SNX",
	// "Balancer": "BAL"
};

// Token ABI
export const TOKEN_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Deposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Invested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdrawn",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "invest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "invested",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "stablecoin",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalPool",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "uniswapRouter",
		"outputs": [
			{
				"internalType": "contract IPool",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawInvest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
// Interfaces for agent data and token info
interface AgentData {
	marketCap: { [token: string]: number };
	volumeData: { [token: string]: number };
	tokenSentiments: { [token: string]: number };
	priceData: { [token: string]: number };
	marketPredictionVol: { [token: string]: number };
	marketPredictionPrice: { [token: string]: number };
	marketPredictionCap: { [token: string]: number };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const retry = async <T>(fn: () => Promise<T>, retries: number = CONFIG.MAX_RETRIES, delay: number = CONFIG.RETRY_DELAY): Promise<T> => {
	try {
		return await fn();
	} catch (error) {
		if (retries <= 0) throw error;
		await sleep(delay);
		return retry(fn, retries - 1, delay * 2);
	}
};

// TokenManagerAgent class (same as your initial implementation)
// Adding this class as it is from your provided code, just skipping detailed implementation for brevity
export class TokenManagerAgent {
	private contract: ethers.Contract;
	private sentimentAgent: SentimentAnalysisAgent;
	private signer: ethers.Wallet;

	constructor(
		contractAddress: string,
		signer: ethers.Wallet,
		sentimentAgent: SentimentAnalysisAgent
	) {
		this.contract = new ethers.Contract(contractAddress, TOKEN_ABI, signer);
		this.sentimentAgent = sentimentAgent;
		this.signer = signer;
	}

	async addToken(name: string, ticker: string) {
		await this.sentimentAgent.addToken(name, ticker);
	}

	async analyzeToken(tokenAddress: string): Promise<{
		sentiment: number;
		signal: 'positive' | 'negative' | 'neutral';
	}> {

		const sentiment = await retry(() =>
			this.sentimentAgent.analyzeTokenSentiment(tokenAddress)
		);

		let signal: 'positive' | 'negative' | 'neutral';
		if (sentiment > CONFIG.SENTIMENT_THRESHOLD) {
			signal = 'positive';
		} else if (sentiment < (1 - CONFIG.SENTIMENT_THRESHOLD)) {
			signal = 'negative';
		} else {
			signal = 'neutral';
		}

		return { sentiment, signal };
	}

	async depositToken(tokenAddress: string, amount: string) {
		const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, this.signer);
	}

	async withdrawToken(tokenAddress: string, amount: string) {
		const tx = await this.contract.withdrawToken(tokenAddress, amount);
		await tx.wait();
	}
}

// Trading System Integration with LLM
export class TradingSystem {
	private tokenManager: TokenManagerAgent;
	private priceFeed: PriceFeedAgent;
	private model: ChatGroq;
	private arimaPredictionAgent: ARIMAPredictionAgent;
	private tokens: Record<string, string>;

	constructor(tokenManager: TokenManagerAgent, tokens: Record<string, string>, arimaPredictionAgent: ARIMAPredictionAgent) {
		this.tokenManager = tokenManager;
		this.priceFeed = new PriceFeedAgent();
		this.tokens = tokens;
		this.model = new ChatGroq({
			apiKey: CONFIG.GROQ_API_KEY,
			modelName: "deepseek-r1-distill-llama-70b",
		});
		this.arimaPredictionAgent = arimaPredictionAgent;
	}

	private async collectAgentData(): Promise<AgentData> {
		const agentData: AgentData = {
			tokenSentiments: {},  // Empty object for token sentiments
			priceData: {},  // Empty object for token prices
			volumeData: {},  // Empty object for token volumes
			marketCap: {},  // Empty object for token market caps
			marketPredictionVol: {},  // Placeholder for market predictions
			marketPredictionPrice: {},  // Placeholder for market predictions
			marketPredictionCap: {},  // Placeholder for market predictions
		};

		// Iterate through all tokens in the dictionary
		await Promise.all(
			Object.keys(this.tokens).map(async (tokenName) => {
				const tokenTicker = this.tokens[tokenName];

				// Collect sentiment and all market data (price, volume, market cap) for each token
				const [sentimentData, tokenData] = await Promise.all([
					this.tokenManager.analyzeToken(tokenName.toLowerCase()),
					this.priceFeed.getTokenData(tokenName.toLowerCase()),  // New method fetching all data in one call
				]);

				// Extract sentiment and market data
				const sentiment = sentimentData.sentiment;
				const { price, volume, marketCap } = tokenData;

				// Get ARIMA market prediction for each token
				const marketPrediction = await this.arimaPredictionAgent.getPrediction(tokenName.toLowerCase());
				await new Promise(resolve => setTimeout(resolve, 10000));

				// Add data to the single agentData object
				agentData.tokenSentiments[tokenName] = sentiment;
				agentData.priceData[tokenName] = price;
				agentData.volumeData[tokenName] = volume;
				agentData.marketCap[tokenName] = marketCap;
				agentData.marketPredictionCap[tokenName] = marketPrediction.marketCap;
				agentData.marketPredictionVol[tokenName] = marketPrediction.volume;
				agentData.marketPredictionPrice[tokenName] = marketPrediction.price;
			})
		);

		// Return the single agentData object
		return agentData;
	}
	private prepareLLMInput(data: AgentData): string {
		let inputDict: string = "";

		for (const [token, sentiment] of Object.entries(data.tokenSentiments)) {
			const price = data.priceData[token];
			const volume = data.volumeData[token];
			const marketCap = data.marketCap[token];
			const marketPredictionVol = data.marketPredictionVol[token];
			const marketPredictionPrice = data.marketPredictionPrice[token];
			const marketPredictionCap = data.marketPredictionCap[token];

			inputDict += ` For Token ${token}
	- Sentiment Analysis on the basis current news: ${(sentiment * 100)}% positive
	- Current Price: $${price}
	- Volume: ${volume}
	- Current Market Cap: $${marketCap}
	- Predicted Volume: ${marketPredictionVol}
	- Predicted Price: $${marketPredictionPrice}
	- Predicted Market Cap: $${marketPredictionCap}
	`;
		}

		// Add LLM instruction separately
		inputDict += `
	Based on these conditions, which tokens should we trade and in what direction?
	#OUTPUT FORMAT
	{
		"token_name" : {"decision" : "buy/sell/hold" , "reason" : "logic behind your decision"}.
		......
	}

	## toke_name is the name of the token that entery represent
	STRICTLY FOLLOW THE OUTPUT FORMAT DO NOT RETURN ANYTHING ELSE
	`;

		return inputDict;
	}

	private async getLLMDecision(data: AgentData): Promise<string> {
		const inputText = this.prepareLLMInput(data);
		const message = new HumanMessage(inputText);
		const response = await this.model.invoke([message]);
		const responseContent = response.content.toString();
		const responseParts = responseContent.split("</think>");
		const rawResponse = responseParts.length > 1 ? responseParts[responseParts.length - 1] : responseContent;

		return rawResponse;
	}

	async execute() {
		console.log("Starting trading execution...");

		try {
			for (const token in this.tokens) {
				const token_name = this.tokens[token]
				await this.tokenManager.addToken(token.toLowerCase(), token_name);
			}

			const agentData = await this.collectAgentData();
			let decision = await this.getLLMDecision(agentData);
			console.log("LLM Trading Decision:", decision);

			const jsonMatch = decision.match(/\{[\s\S]*\}/); // Matches content between `{}` including newlines

			if (jsonMatch) {
				try {
					decision = JSON.parse(jsonMatch[0]); // Parse it into an object
					console.log("Extracted JSON:", decision);
				} catch (error) {
					console.error("Error parsing JSON:", error);
				}
			}
			
			for (const token in this.tokens) {
				const { signal } = await this.tokenManager.analyzeToken(token.toLowerCase());
				const tradeAmount = "10000000000000000"; // Example trade amount

				try {
					if (typeof decision === "string") {
						const lowerCaseDecision = decision.toLowerCase();

						if (signal === "positive" && lowerCaseDecision.includes("buy")) {
							await this.tokenManager.depositToken(token, tradeAmount);
							console.log(`✅ Bought ${token} based on positive sentiment`);
						} else if (signal === "negative" && lowerCaseDecision.includes("sell")) {
							await this.tokenManager.withdrawToken(token, tradeAmount);
							console.log(`✅ Sold ${token} based on negative sentiment`);
						} else {
							console.log(`⚠️ No action for ${token} - Signal: ${signal}, Decision: ${decision}`);
						}
					}
					else {
						const tokenDecisionRaw = decision[token]["decision"];
						if (typeof tokenDecisionRaw === "string") {
							const tokenDecision: string = String(tokenDecisionRaw).toLowerCase();
							if (signal === "positive" && tokenDecision.includes("buy")) {
								await this.tokenManager.depositToken(token, tradeAmount);
								console.log(`✅ Bought ${token} based on positive sentiment`);
							} 
							else if (signal === "negative" && tokenDecision.includes("sell")) {
								await this.tokenManager.withdrawToken(token, tradeAmount);
								console.log(`✅ Sold ${token} based on negative sentiment`);
							} 
							else {
								console.log(`⚠️ No action for ${token} - Signal: ${signal}, Decision: ${tokenDecision}`);
							}
						} 
						else {
							console.warn(`⚠️ Invalid decision type for ${token}:`, tokenDecisionRaw);
						}
					}
				} catch (error) {
					console.error(`🚨 Error executing trade for ${token}:`, error);
				}
			}
		} catch (error) {
			console.error("Trading system execution failed:", error);
		}

		setTimeout(() => this.execute(), 60000)
	}
}

// Initialize agents
 const sentimentAgent = new SentimentAnalysisAgent();
 const arimaPredictionAgent = new ARIMAPredictionAgent(arimaConfig);
 const tokenManager = new TokenManagerAgent(
	CONFIG.CONTRACT_ADDRESS,
	new ethers.Wallet(CONFIG.PRIVATE_KEY, new ethers.JsonRpcProvider(CONFIG.INFURA_URL)),
	sentimentAgent
);

// Instantiate and execute TradingSystem
 const tradingSystem = new TradingSystem(tokenManager, TOKENS, arimaPredictionAgent);
tradingSystem.execute();
