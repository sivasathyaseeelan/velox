// Set up your Ethereum provider (make sure to use your own provider URL)
import { ethers } from "ethers";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { orgConfig } from './nillionOrgConfig.ts'
import { SecretVaultWrapper } from './wrapper.ts'

// =================== Warden Agent Kit Imports ===================
import { WardenAgentKit } from "@wardenprotocol/warden-agent-kit-core";
import { WardenToolkit } from "@wardenprotocol/warden-langchain";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
// ================================================================

dotenv.config();



const SCHEMA_ID = process.env.SCHEMA_ID;

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR-PRIVATE-KEY");

// Use a wallet to sign transactions
const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
const contractAddress = process.env.CONTRACT_KEY || "YOUR-CONTRACT-ADRESS";
const contractABI = [
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
];

interface AssetData {
	crypto_name: string;
	balance : number;
	totalLiquidity: string;
	availableLiquidity: string;
	utilizationRate: string;
	variableBorrowRate: string;
	stableBorrowRate: string;
	totalVariableDebt: string;
	totalStableDebt: string;
	lifetimeFlashLoans: string;
	lifetimeLiquidated: string;
	liquidityIndex: string;
	variableBorrowIndex: string;
	reserveFactor: string;
	totalDebt: string;
	avg30DaysVariableBorrowRate: string;
	avg30DaysLiquidityRate: string;
	avg1DaysVariableBorrowRate: string;
	avg7DaysVariableBorrowRate: string;
	avg7DaysLiquidityRate: string;
	priceInEth: string;
}

const poolContract = new ethers.Contract(process.env.CONTRACT_ADDRESS || "CONTACT_ADDRESS", contractABI, signer);

// Setup LLM model
const model = new ChatGroq({
	apiKey: process.env.GROQ_API_KEY || "GROQ-API",
	modelName: "deepseek-r1-distill-llama-70b",
});

async function initializeWardenAgent() {
	try {
		const llm = new ChatGroq({
			apiKey: process.env.GROQ_API_KEY || "GROQ-API",
			modelName: "deepseek-r1-distill-llama-70b",
		});

		const config = {
			privateKeyOrAccount: process.env.PRIVATE_KEY
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
				"You're an assistant specialized in web3 trading transactions. "
		});

		return { agent, agentConfig };
	} catch (error) {
		console.error("Failed to initialize Warden agent:", error);
		throw error;
	}
}

// Function to call LLM
async function llmCall( message: HumanMessage) {
	const { agent: wardenAgent, agentConfig } = await initializeWardenAgent();
	const response = await wardenAgent.invoke(
		{ messages: [message] },
		agentConfig
	);
	
	const resultContent = response.messages?.[1]?.content ?? '';
	return resultContent;
}

async function getTokenBalance(id:string) {
	const tx = await poolContract.poolBalance();
	console.log(tx)
	return Number(tx);
}

const fetchLiquidityRates = async () => {
	const aaveRates = await fetch(`https://aave-api-v2.aave.com/data/liquidity/v1?poolId=0xb53c1a33016b2dc2ff3653530bff1848a515c8c5&date=03-10-2024`).then(res => res.json());
	const data_Structure = {} as Record<string, AssetData>;

	let i = 0;

	// Iterate over Aave's reserve data
	for (const asset in aaveRates) {
		const crypto = aaveRates[asset];
		if (crypto["symbol"].toLowerCase() != 'weth') continue;
		i += 1;
		const symbol = crypto["symbol"];

		// Creating a structured object with key metrics for each symbol
		data_Structure[symbol] = {
			totalLiquidity: crypto["totalLiquidity"],
			balance : await getTokenBalance(crypto["id"]),
			availableLiquidity: crypto["availableLiquidity"],
			utilizationRate: crypto["utilizationRate"],
			variableBorrowRate: crypto["variableBorrowRate"],
			stableBorrowRate: crypto["stableBorrowRate"],
			totalVariableDebt: crypto["totalVariableDebt"],
			totalStableDebt: crypto["totalStableDebt"],
			lifetimeFlashLoans: crypto["lifetimeFlashLoans"],
			lifetimeLiquidated: crypto["lifetimeLiquidated"],
			liquidityIndex: crypto["liquidityIndex"],
			variableBorrowIndex: crypto["variableBorrowIndex"],
			reserveFactor: crypto["reserveFactor"],
			totalDebt: crypto["totalDebt"],
			avg30DaysVariableBorrowRate: crypto["avg30DaysVariableBorrowRate"],
			avg30DaysLiquidityRate: crypto["avg30DaysLiquidityRate"],
			avg1DaysVariableBorrowRate: crypto["avg1DaysVariableBorrowRate"],
			avg7DaysVariableBorrowRate: crypto["avg7DaysVariableBorrowRate"],
			avg7DaysLiquidityRate: crypto["avg7DaysLiquidityRate"],
			priceInEth: crypto["price"]["priceInEth"],
			crypto_name: symbol
		};
	}

	console.log(data_Structure)

	return data_Structure;
};

// // Prepare input for LLM
const prepareLLMInput = (data: Record<string, AssetData>): string => {
	return `
    
    What is the best course of action for maximizing yield based on these conditions? Should I deposit or withdraw assets?
	You are provided with the data, where each cryptocurrency symbol is the key, and its value is another dict that contains the financial data. 
	For each cryptocurrency symbol given in the data , provide a decision to withdraw or deposit, the exact amount to be depost/withdraw, along with the reason, in the format given below:
    
	
	
	#OUTPUT FORMAT : 
	{
		"crypto_name" : { "decision" : "withdraw/deposit" ,  amount : "exact number to deposit/withdraw", "reason" : "logic behind your decision"},
		...
		}

	Base your answer on the basis of given details and general information
	RETURN DECISION FOR EACH CRYPTO SYMBOL PROVIDED IN THE DATA ONLY
	AMOUNT MUST A INTEGER VALUE
	
	STRICTLY FOLLOW THE OUTPUT FORMAT. DO NOT RETURN ANYTHING ELSE
	NOTE AMOUNT SHOULD NOT EXCEED THE BALANCE OF RESPECTIVE crypto , do not violate this condition.
	
	##INPUT
	${JSON.stringify(data, null, 2)}
	`;
};

// // Get LLM decision
const getLLMDecision = async ( agentData: Record<string, AssetData>) => {
	const inputText = prepareLLMInput(agentData);
	const message = new HumanMessage(inputText);
	const response = await llmCall( message);

	const responseContent = response.toString();
	console.log(responseContent)
	const responseParts = responseContent.split("</think>");
	const rawResponse = responseParts.length > 1 ? responseParts[responseParts.length - 1] : responseContent;

	return rawResponse;
};

// // Execute decision
const handleLLMDecision = async (decision: any) => {
	console.log(decision)

	if (decision["decision"] == "deposit") {
		await depositFunds(decision["amount"]); // Deposits 0.002 ETH
	} else if (decision["decision"] == "withdraw") {
		await withdrawFunds(decision["amount"]); // Withdraws 0.001 ETH
	} else {
		console.log("No action needed.");
	}
};
// Simulated data collection
const collectAgentData = async (): Promise<Record<string, AssetData>> => {
	return fetchLiquidityRates();
};

// Deposit function
const depositFunds = async (amount: string) => {
	  const tx = await poolContract.invest(amount);
	  await tx.wait();
	console.log(`Deposited ${amount} USDT`);
};

// Withdraw function
const withdrawFunds = async (amount: string) => {
	  const tx = await poolContract.withdrawInvest(amount);
	  await tx.wait();
	console.log(`Withdrawn ${amount} ETH`);
};

// Main agentic workflow
const runLLMBasedSystem = async () => {
	const collection = new SecretVaultWrapper(
		orgConfig.nodes,
		orgConfig.orgCredentials,
		SCHEMA_ID
	);
	await collection.init();
	console.log("Starting Agentic System...");

	const agentData: Record<string, AssetData> = await collectAgentData();

	// Get decision from LLM
	let decision = await getLLMDecision( agentData);
	const jsonMatch = decision.match(/\{[\s\S]*\}/);

	if (jsonMatch) {
		try {
			decision = JSON.parse(jsonMatch[0]);
			const temp_decision = JSON.parse(jsonMatch[0]); // Parse it into an object
			for (const token in temp_decision) {
				console.log(temp_decision[token])
				await handleLLMDecision(temp_decision[token]);
				const data = [
					{
						cryptocurrency_symbol: token, // name will be encrypted to a $share
						decision: temp_decision[token]["decision"], // years_in_web3 will be encrypted to a $share
						current_amount: temp_decision[token]["amount"].toString(),
						reason: temp_decision[token]["reason"]
					},
				];
				console.log(data)

				const dataWritten = await collection.writeToNodes(data);
				const newIds = [
					...new Set(dataWritten.map((item) => item.result.data.created).flat()),
				];
				const decryptedCollectionData = await collection.readFromNodes({});
				console.log(
					'Most recent records',
					decryptedCollectionData.slice(0, data.length)
				);
			}
		} 
		catch (error) {
			console.error("Error parsing JSON:", error);
		}
	}
	else if (typeof decision == "string") {
		await handleLLMDecision(decision.toString());
	}
	setTimeout(() => {
		runLLMBasedSystem().catch(console.error);  // Run again after delay
	}, 10000);

	// Get balance after execution
	//   await getContractBalance();
};

// Start system
runLLMBasedSystem().catch(console.error);
