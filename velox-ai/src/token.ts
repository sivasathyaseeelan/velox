import { ethers } from "ethers";
import dotenv from "dotenv";
import { HumanMessage } from "@langchain/core/messages";
import { SentimentAnalysisAgent } from ".sentiment.ts"
import { ARIMAPredictionAgent } from "./arima.ts"
import { PriceFeedAgent } from "./arima.ts";
import { ChatGroq } from "@langchain/groq";
import { orgConfig } from './nillionOrgConfig.ts';
import { SecretVaultWrapper } from './wrapper.ts';
import { fetchPrice } from './eoracle.ts'

// =================== Warden Agent Kit Imports ===================
import { WardenAgentKit } from "@wardenprotocol/warden-agent-kit-core";
import { WardenToolkit } from "@wardenprotocol/warden-langchain";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
// ================================================================

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

const SCHEMA_ID = process.env.SCHEMA_ID || "SCHEMA-ID";

const arimaConfig = {
    p: 0.5,
    d: 1,
    q: 1
};

const TOKENS = {
    "Ethereum": "ETH",
	"USD" : "USDC",
    // "Uniswap": "UNI",
};

// // Token ABI remains the same as in your original code
// const TOKEN_ABI = [
// 	{
// 		"inputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "constructor"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "owner",
// 				"type": "address"
// 			}
// 		],
// 		"name": "OwnableInvalidOwner",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "account",
// 				"type": "address"
// 			}
// 		],
// 		"name": "OwnableUnauthorizedAccount",
// 		"type": "error"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "user",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "Deposited",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "token",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "Invested",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "previousOwner",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "newOwner",
// 				"type": "address"
// 			}
// 		],
// 		"name": "OwnershipTransferred",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "user",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "Withdrawn",
// 		"type": "event"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"name": "balances",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "deposit",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "invest",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "invested",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "owner",
// 		"outputs": [
// 			{
// 				"internalType": "address",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "renounceOwnership",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "stablecoin",
// 		"outputs": [
// 			{
// 				"internalType": "contract IERC20",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "totalPool",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "newOwner",
// 				"type": "address"
// 			}
// 		],
// 		"name": "transferOwnership",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "uniswapRouter",
// 		"outputs": [
// 			{
// 				"internalType": "contract IPool",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "withdraw",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "withdrawInvest",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	}
// ];

const TOKEN_ABI = [
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
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenIn",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "tokenOut",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amountIn",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amountOutMin",
				"type": "uint256"
			}
		],
		"name": "swapTokensForTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "WithdrawInvestment",
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
		"name": "tokenOutEvent",
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
		"name": "balanceOfToken",
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
		"inputs": [],
		"name": "getContractNetWorth",
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
				"name": "tokenIn",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "tokenOut",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amountIn",
				"type": "uint256"
			}
		],
		"name": "getEstimatedTokensOut",
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
		"name": "getTokens",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isTokenPresent",
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
				"name": "token",
				"type": "address"
			}
		],
		"name": "myBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
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
				"name": "user",
				"type": "address"
			}
		],
		"name": "MyMoney",
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
		"name": "Pool",
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
		"inputs": [],
		"name": "poolBalance",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tokens",
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
		"name": "totalInvestment",
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
		"name": "uniswapRouter",
		"outputs": [
			{
				"internalType": "contract IUniswapV2Router02",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const provider = new ethers.JsonRpcProvider(CONFIG.INFURA_URL);
const signer = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
const poolContract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, TOKEN_ABI, signer);

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

class TokenManagerAgent {
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

	async analyzeToken(tokenAddress: string): Promise<{ sentiment: number; signal: "positive" | "negative" | "neutral"; }> {
		const sentiment = await retry(() =>
			this.sentimentAgent.analyzeTokenSentiment(tokenAddress)
		);

		let signal: "positive" | "negative" | "neutral";
		if (sentiment > CONFIG.SENTIMENT_THRESHOLD) {
			signal = "positive";
		} else if (sentiment < 1 - CONFIG.SENTIMENT_THRESHOLD) {
			signal = "negative";
		} else {
			signal = "neutral";
		}

		return { sentiment, signal };
	}

	async depositToken(tokenAddress: string, amount: string) {
		// Example deposit logic (you may need to adjust for your contract)
		const tx = await poolContract.deposit(amount );
		await tx.wait();
		console.log(`Deposited ${amount} USDT`);
		console.log(`Depositing ${amount} for ${tokenAddress}`);
	}

	async withdrawToken(tokenAddress: string, amount: string) {
		const tx = await this.contract.withdrawToken(tokenAddress, amount);
		await tx.wait();
		console.log(`Withdrew ${amount} for ${tokenAddress}`);
	}
}

class TradingSystem {
    private tokenManager: TokenManagerAgent;
    private priceFeed: PriceFeedAgent;
    private arimaPredictionAgent: ARIMAPredictionAgent;
    private tokens: Record<string, string>;
    private wardenAgent: any;
    private wardenConfig: any;
    private model: ChatGroq;

    constructor(
        tokenManager: TokenManagerAgent,
        tokens: Record<string, string>,
        arimaPredictionAgent: ARIMAPredictionAgent,
        wardenAgent: any,
        wardenConfig: any
    ) {
        this.tokenManager = tokenManager;
        this.priceFeed = new PriceFeedAgent();
        this.tokens = tokens;
        this.model = new ChatGroq({
            apiKey: CONFIG.GROQ_API_KEY,
            modelName: "deepseek-r1-distill-llama-70b",
        });
        this.arimaPredictionAgent = arimaPredictionAgent;
        this.wardenAgent = wardenAgent;
        this.wardenConfig = wardenConfig;
    }

    private async collectAgentData(): Promise<AgentData> {
        const agentData: AgentData = {
            tokenSentiments: {},
            priceData: {},
            volumeData: {},
            marketCap: {},
            marketPredictionVol: {},
            marketPredictionPrice: {},
            marketPredictionCap: {},
        };

        await Promise.all(
            Object.keys(this.tokens).map(async (tokenName) => {
                const [sentimentData, tokenData] = await Promise.all([
                    this.tokenManager.analyzeToken(tokenName.toLowerCase()),
                    this.priceFeed.getTokenData(tokenName.toLowerCase()),
                ]);

                const sentiment = sentimentData.sentiment;
                console.log("sentiment done");
                const { price, volume, marketCap } = tokenData;
                const marketPrediction = await this.arimaPredictionAgent.getPrediction(tokenName.toLowerCase());
                await sleep(10000);

				const upDatePrice = await fetchPrice(1);

                agentData.tokenSentiments[tokenName] = sentiment;
                agentData.priceData[tokenName] = Number(upDatePrice) || price;
                agentData.volumeData[tokenName] = volume;
                agentData.marketCap[tokenName] = marketCap;
                agentData.marketPredictionCap[tokenName] = marketPrediction.marketCap;
                agentData.marketPredictionVol[tokenName] = marketPrediction.volume;
                agentData.marketPredictionPrice[tokenName] = marketPrediction.price;
            })
        );

        return agentData;
    }

    private prepareLLMInput(data: AgentData): string {
        let inputDict = "";

        for (const [token, sentiment] of Object.entries(data.tokenSentiments)) {
            const price = data.priceData[token];
            const volume = data.volumeData[token];
            const marketCap = data.marketCap[token];
            const marketPredictionVol = data.marketPredictionVol[token];
            const marketPredictionPrice = data.marketPredictionPrice[token];
            const marketPredictionCap = data.marketPredictionCap[token];

            inputDict += ` For Token ${token}
  - Sentiment Analysis: ${(sentiment * 100).toFixed(2)}% positive
  - Current Price: $${price}
  - Volume: ${volume}
  - Current Market Cap: $${marketCap}
  - Predicted Volume: ${marketPredictionVol}
  - Predicted Price: $${marketPredictionPrice}
  - Predicted Market Cap: $${marketPredictionCap}
`;
        }

        inputDict += `
Based on these conditions, which tokens should we trade and in what direction? Keep in mind the predicted values based on statistical models.
#OUTPUT FORMAT : 
            {
                'crypto_name' : { 'action' : 'buy/sell', 'amount': 'value in range 1 to 100', 'reason' : 'logic behind your decision'},
                ...
            }
STRICTLY FOLLOW THE OUTPUT FORMAT AND DO NOT RETURN ANYTHING ELSE. Insert the token names where relevant. Write crypto name in string.
`;
        return inputDict;
    }

    private async getLLMDecision(data: AgentData): Promise<any> {
        try {
            const inputText = this.prepareLLMInput(data);
            const message = new HumanMessage(inputText);

            let response;
            try {
                response = await this.wardenAgent.invoke(
                    { messages: [message] },
                    this.wardenConfig
                );
                
                const resultContent = response.messages?.[1]?.content ?? '';
				console.log("-------------------Decision---------------------")
				console.log(resultContent)
				const responseContent = resultContent.toString();
				const responseParts = responseContent.split("</think>");
				const rawResponse = responseParts.length > 1 ? responseParts[responseParts.length - 1] : responseContent;
                if (rawResponse) {
                    const decision = this.parseDecisionResponse(rawResponse);
                    if (decision) return decision;
                }
            } catch (error) {
                console.warn("Warden agent failed, falling back to ChatGroq:", error);
            }

            const fallbackResponse = await this.model.invoke([message]);
            const fallbackContent = fallbackResponse.content;
            
            if (typeof fallbackContent === 'string' && fallbackContent.trim()) {
                return this.parseDecisionResponse(fallbackContent);
            }

            throw new Error("Both LLM attempts failed to produce valid output");

        } catch (error) {
            console.error("Error in getLLMDecision:", error);
            return null;
        }
    }

    private parseDecisionResponse(response: string): any {
        try {
            
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON object found in response");
            }

            const decision = JSON.parse(jsonMatch[0]);
            
            for (const [cryptoName, details] of Object.entries(decision)) {
                if (typeof cryptoName !== 'string') {
                    throw new Error(`Invalid crypto name: ${cryptoName}`);
                }
                
                if (!details || typeof details !== 'object') {
                    throw new Error(`Invalid decision details for ${cryptoName}`);
                }

                const { action: taction,  amount : amt, reason: rson } = details as any;

				console.log(taction)
				console.log(amt)
				console.log(rson)
                
                if (!taction || !['sell', 'buy'].includes(taction)) {
                    throw new Error(`Invalid decision action for ${cryptoName}: ${taction}`);
                }
                
                if (!amt || !rson) {
                    throw new Error(`Missing required fields for ${cryptoName}`);
                }
            }

            console.log("✅ Successfully parsed decision:", decision);
            return decision;

        } catch (error) {
            console.error("Error parsing decision response:", error);
            return null;
        }
    }

    private async executeTradeAction(token: string, amount: string, tokenDecision: string): Promise<void> {
        try {
            // const tokenDecision = decision[token.toLowerCase()];

            if (tokenDecision) {
                // const { signal } = await this.tokenManager.analyzeToken(token.toLowerCase());
                // const { decision: action, action: tradeAction } = tokenDecision;

                if ( tokenDecision === "buy") {
                    await this.tokenManager.depositToken(token, amount);
                    console.log(`✅ Deposited ${amount} for ${token}`);
                } else if (tokenDecision === "sell") {
                    await this.tokenManager.withdrawToken(token, amount);
                    console.log(`✅ Withdrawn ${amount} for ${token}`);
                } else {
                    console.log(`⚠️ No action for ${token} -  Decision: ${tokenDecision}`);
                }
            }
        } catch (error) {
            console.error(`🚨 Error executing trade for ${token}:`, error);
        }
    }

    async execute() {
        try {
            console.log("🚀 Starting trading execution...");

			for (const token in this.tokens) {
				const token_name = this.tokens[token]
				await this.tokenManager.addToken(token.toLowerCase(), token_name);
			}
            
            const collection = new SecretVaultWrapper(
                orgConfig.nodes,
                orgConfig.orgCredentials,
                SCHEMA_ID
            );
            await collection.init();

            const agentData = await this.collectAgentData();
            const decision = await this.getLLMDecision(agentData);

			console.log(decision)

            if (!decision) {
                throw new Error("Failed to get valid trading decision");
            }

            for (const [token, details] of Object.entries(decision)) {
                const { action: tradeAction, amount : amt, reason : reasons } = details as any;
                
                await this.executeTradeAction(token, amt, tradeAction);

				console.log("Warden Success");

                const data = [{
                    cryptocurrency_symbol: token,
                    decision: tradeAction,
                    current_amount: amt,
                    reason: reasons
                }];

				// console.log(data);

                const dataWritten = await collection.writeToNodes(data);
                console.log(`✅ Trade executed and recorded for ${token}`);
            }

            setTimeout(() => this.execute(), 10000);

        } catch (error) {
            console.error("❌ Trading system execution failed:", error);
            setTimeout(() => this.execute(), 10000);
        }
    }
}

async function initializeWardenAgent() {
    try {
        const llm = new ChatGroq({
            apiKey: CONFIG.GROQ_API_KEY,
            modelName: "deepseek-r1-distill-llama-70b",
        });

        const config = {
            privateKeyOrAccount: CONFIG.PRIVATE_KEY
        };

        const agentkit = new WardenAgentKit(config);
        const wardenToolkit = new WardenToolkit(agentkit);
        const tools = wardenToolkit.getTools();

        const memory = new MemorySaver();
        const agentConfig = {
            configurable: { thread_id: "Warden Agent Kit Trading Agent" },
        };

        const agent = createReactAgent({
            llm,
            tools,
            checkpointSaver: memory,
            messageModifier:
                "You're an assistant specialized in web3 trading transactions. " +
                "Based on the provided data make the decision in the following format : " + 
                `OUTPUT FORMAT : 
				{ 
					"token_name"  :  {"action": "buy/sell", "amount" : "value in range 1 to 100", "reason" : "logic behind your decision"},
					...
		 } `
        });

        return { agent, agentConfig };
    } catch (error) {
        console.error("Failed to initialize Warden agent:", error);
        throw error;
    }
}

async function main() {
    try {
        const { agent: wardenAgent, agentConfig } = await initializeWardenAgent();

        const sentimentAgent = new SentimentAnalysisAgent();
        const arimaPredictionAgent = new ARIMAPredictionAgent(arimaConfig);
        const wallet = new ethers.Wallet(
            CONFIG.PRIVATE_KEY,
            new ethers.JsonRpcProvider(CONFIG.INFURA_URL)
        );
        const tokenManager = new TokenManagerAgent(
            CONFIG.CONTRACT_ADDRESS,
            wallet,
            sentimentAgent
        );

        const tradingSystem = new TradingSystem(
            tokenManager,
            TOKENS,
            arimaPredictionAgent,
            wardenAgent,
            agentConfig
        );

        await tradingSystem.execute();

    } catch (error) {
        console.error("Fatal error in main:", error);
        process.exit(1);
    }
}

main();