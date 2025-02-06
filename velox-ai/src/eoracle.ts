import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.linea.build");

// Use the proxy contract address
const contractAddress = process.env.ORACLE_ADDRESS || "YOUR-ORACLE-CONTRACT-ADDRESS";

const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"InvalidAddress","type":"error"},{"inputs":[],"name":"InvalidInitialization","type":"error"},{"inputs":[],"name":"NotInitializing","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint64","name":"version","type":"uint64"}],"name":"Initialized","type":"event"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"getAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFeedId","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"","type":"uint80"}],"name":"getRoundData","outputs":[{"internalType":"uint80","name":"","type":"uint80"},{"internalType":"int256","name":"","type":"int256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint80","name":"","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"getTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"feedManager","type":"address"},{"internalType":"uint16","name":"feedId","type":"uint16"},{"internalType":"uint8","name":"inputDecimals","type":"uint8"},{"internalType":"uint8","name":"outputDecimals","type":"uint8"},{"internalType":"string","name":"feedDescription","type":"string"},{"internalType":"uint256","name":"feedVersion","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"latestAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRoundData","outputs":[{"internalType":"uint80","name":"","type":"uint80"},{"internalType":"int256","name":"","type":"int256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint80","name":"","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

const contract = new ethers.Contract(contractAddress, abi, provider);

export async function fetchPrice(symbolId : number)  : Promise<BigInt> {
  try {
    const priceFeed = await contract.getAnswer(symbolId);
    // console.log(`Price: ${priceFeed}`);
    console.log(typeof(priceFeed))
    const priceFeed1 = priceFeed/BigInt(100000000);
    console.log(`Price: ${priceFeed1}`);
    return priceFeed1;
  } catch (error) {
    console.error("Error fetching price feed:", error);
    return BigInt(-1);
  }
  
}

// Example usage: Fetch price for ETH:USD (symbolId = 1)
fetchPrice(0);
