// Set up your Ethereum provider (make sure to use your own provider URL)
import { ethers } from "ethers";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { orgConfig } from './nillionOrgConfig'
import { SecretVaultWrapper } from './wrapper'
dotenv.config();



const SCHEMA_ID = process.env.SCHEMA_ID;

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/acfdf85ba2ac41cbacc85b11a0cf5faa");

// Use a wallet to sign transactions
const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
const contractAddress = process.env.CONTRACT_KEY;
const contractABI = [
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

interface AssetData {
	crypto_name: string
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

// const poolContract = new ethers.Contract(contractAddress, contractABI, signer);

// Setup LLM model
const model = new ChatGroq({
	apiKey: "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",
	modelName: "deepseek-r1-distill-llama-70b",
});

// Function to call LLM
async function llmCall(message: HumanMessage) {
	const res = await model.invoke([message]);
	return res.content;
}

const fetchLiquidityRates = async () => {
	const aaveRates = await fetch(`https://aave-api-v2.aave.com/data/liquidity/v1?poolId=0xb53c1a33016b2dc2ff3653530bff1848a515c8c5&date=03-10-2024`).then(res => res.json());
	const data_Structure = {} as Record<string, AssetData>;

	let i = 0;

	// Iterate over Aave's reserve data
	for (const asset in aaveRates) {
		if (i == 5) break;
		i += 1;
		const crypto = aaveRates[asset];
		const symbol = crypto["symbol"];

		// Creating a structured object with key metrics for each symbol
		data_Structure[symbol] = {
			totalLiquidity: crypto["totalLiquidity"],
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

	return data_Structure;
};
// // Prepare input for LLM
const prepareLLMInput = (data: Record<string, AssetData>): string => {
	return `
    
    What is the best course of action for maximizing yield based on these conditions? Should I deposit or withdraw assets?
	You are provided with the data, where each cryptocurrency symbol is the key, and its value is another dict that contains the financial data. 
	For each cryptocurrency symbol given in the data , provide a decision to withdraw or deposit, the new percentage of portfolio value, along with the reason, in the format given below:
    
	ensure that the sum of amount values amounts to a 100. this is a MUST, do not violate this condition.
	Base your answer on the basis of given details and general information
	RETURN DECISION FOR EACH CRYPTO SYMBOL PROVIDED IN THE DATA ONLY

	#OUTPUT FORMAT : 
			{
				"crypto_name" : { "decision" : "withdraw/deposit" ,  amount : "percentage of total portfolio value", "reason" : "logic behind your decision"},
				...
			}

	STRICTLY FOLLOW THE OUTPUT FORMAT. DO NOT RETURN ANYTHING ELSE
	
	##INPUT
	${JSON.stringify(data, null, 2)}
	`;
};

// // Get LLM decision
const getLLMDecision = async (agentData: Record<string, AssetData>) => {
	const inputText = prepareLLMInput(agentData);
	const message = new HumanMessage(inputText);
	const response = await llmCall(message);

	const responseContent = response.toString();
	const responseParts = responseContent.split("</think>");
	const rawResponse = responseParts.length > 1 ? responseParts[responseParts.length - 1] : responseContent;

	return rawResponse;
};

// // Execute decision
const handleLLMDecision = async (decision: string) => {
	if (decision.includes("deposit")) {
		await depositFunds("100"); // Deposits 0.002 ETH
	} else if (decision.includes("withdraw")) {
		await withdrawFunds("0.001"); // Withdraws 0.001 ETH
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
	//   const tx = await poolContract.invest(amount );
	//   await tx.wait();
	console.log(`Deposited ${amount} USDT`);
};

// Withdraw function
const withdrawFunds = async (amount: string) => {
	//   const tx = await poolContract.withdrawInvest("10000000000000000" );
	//   await tx.wait();
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
	let decision = await getLLMDecision(agentData);
	const jsonMatch = decision.match(/\{[\s\S]*\}/);

	if (jsonMatch) {
		try {
			decision = JSON.parse(jsonMatch[0]); // Parse it into an object
			const temp_decision = JSON.parse(jsonMatch[0]); // Parse it into an object
			for (const token in temp_decision) {
				await handleLLMDecision(JSON.stringify(temp_decision[token], null, 2));
				const data = [
					{
						cryptocurrency_symbol: token, // name will be encrypted to a $share
						decision: temp_decision[token]["decision"], // years_in_web3 will be encrypted to a $share
						current_amount: 100,
						reason: temp_decision[token]["reason"]
					},
				];
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
// fetchLiquidityRates()
