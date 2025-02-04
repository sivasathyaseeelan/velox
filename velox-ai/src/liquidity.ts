// Set up your Ethereum provider (make sure to use your own provider URL)
import { ethers } from "ethers";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";

const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/acfdf85ba2ac41cbacc85b11a0cf5faa");

// Use a wallet to sign transactions
const signer = new ethers.Wallet("YOUR-PRIVATE-KEY", provider);
// Replace with your deployed contract address
const contractAddress = "CONTRACT-ADDRESS";
// ABI matching the InvestmentPool contract
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

const poolContract = new ethers.Contract(contractAddress, contractABI, signer);

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

// Define data structure
interface AgentData {
  lendingRates: { [protocol: string]: number };
  gasFees: string;
  riskScore: number;
  portfolioValue: string;
}

// Prepare input for LLM
const prepareLLMInput = (data: AgentData): string => {
  return `
    Lending rates:
    Aave: ${data.lendingRates['Aave']}%
    Compound: ${data.lendingRates['Compound']}%
    
    Current Gas Fee: ${data.gasFees} Gwei
    
    Protocol Risk Score: ${data.riskScore}/100
    
    Current Portfolio Value: ${data.portfolioValue}
    
    What is the best course of action for maximizing yield based on these conditions? Should I deposit or withdraw assets?
    
    #OUTPUT FORMAT
                        [
                            { "decision" : "withdraw/deposit" , "reason" : "logic behind your decision"}
                            ......
                        ]
                        STRICTLY FOLLOW THE OUTPUT FORMAT DO NOT RETURN ANYOTHER THINK`;
};

// Get LLM decision
const getLLMDecision = async (agentData: AgentData) => {
  const inputText = prepareLLMInput(agentData);
  const message = new HumanMessage(inputText);
  const response = await llmCall(message);
  return response;
};

// Execute decision
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
const collectAgentData = async (): Promise<AgentData> => {
  return {
    lendingRates: { Aave: 5.5, Compound: 4.8 },
    gasFees: "25",
    riskScore: 20,
    portfolioValue: "20000",
  };
};

// Deposit function
const depositFunds = async (amount: string) => {
  const tx = await poolContract.invest(amount );
  await tx.wait();
  console.log(`Deposited ${amount} USDT`);
};

// Withdraw function
const withdrawFunds = async (amount: string) => {
  const tx = await poolContract.withdrawInvest("10000000000000000" );
  await tx.wait();
  console.log(`Withdrawn ${amount} ETH`);
};

// Get contract balance
const getContractBalance = async () => {
  const balance = await poolContract.getContractBalance();
  console.log(`Contract Balance: ${ethers.utils.formatEther(balance)} ETH`);
}; 

// Main agentic workflow
const runLLMBasedSystem = async () => {
  console.log("Starting Agentic System...");

  const agentData: AgentData = await collectAgentData();

  // Get decision from LLM
  const decision = await getLLMDecision(agentData);
  console.log("LLM Decision:", decision);

  // Execute action
  await handleLLMDecision(decision.toString());

  setTimeout(() => {
    runLLMBasedSystem().catch(console.error);  // Run again after delay
  },10000);

  // Get balance after execution
//   await getContractBalance();
};

// Start system
runLLMBasedSystem().catch(console.error);
