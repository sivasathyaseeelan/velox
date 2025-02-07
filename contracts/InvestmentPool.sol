// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IUniswapV2Router02.sol";

contract AIInvestmentPool is Ownable {
    address USDC=0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8;
    IERC20 public stablecoin = IERC20(USDC);
    IPool public Pool= IPool(0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951);
    IUniswapV2Router02 public uniswapRouter= IUniswapV2Router02(0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008);

    // mapping of user address to their balance
    mapping( address=> uint256) public balances;

    // Current USDC token in the contract
    uint256 public totalInvestment;

    // mapping of token address to their balance in contract
    mapping( address => uint256) public balanceOfToken;
    mapping( address => uint256) public isTokenPresent;
    address[] public tokens;

    
    event Deposited(address indexed user, uint256 amount);
    event tokenOutEvent(address indexed token, uint256 amount);
    event Invested(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event WithdrawInvestment(address indexed user, uint256 amount);


    constructor( ) Ownable(msg.sender) {
        tokens.push(0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8);
        isTokenPresent[0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8]=1;
        transferOwnership(msg.sender);  // Transfer ownership to the specified address
    }



    // get the estimated amount of tokens out for a given amount of token in
    function getEstimatedTokensOut(address tokenIn, address tokenOut, uint256 amountIn) public view returns (uint256) {
        address[] memory path = new address[](2);

        path[0]=(tokenIn);
        path[1]=(tokenOut);

        uint[] memory amountsOut = uniswapRouter.getAmountsOut(amountIn, path);
        return amountsOut[1]; 
    }



    // swap tokens for tokens
    function swapTokensForTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin) public {
        IERC20(tokenIn).approve(address(Pool), amountIn);  

        address[] memory path = new address[](2);

        path[0]=(tokenIn);
        path[1]=(tokenOut);

        uint[] memory amount=uniswapRouter.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        if(isTokenPresent[tokenOut]==0){
            tokens.push(tokenOut);
            isTokenPresent[tokenOut]=1;
        }

        balanceOfToken[tokenIn]-=amount[0];
        balanceOfToken[tokenOut]+=amount[1];
        emit tokenOutEvent(tokenOut,amount[1]);
        
    }


    // Contract balance for a specific token
    function myBalance(address token) public  view returns (uint256 amount){
        return IERC20(token).balanceOf(token);
    }


    // Deposit USDC tokens to the contract
    function deposit(uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero");
        stablecoin.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        balanceOfToken[USDC] += amount;
        totalInvestment+=amount;
        emit Deposited(msg.sender, amount);
    }


    // get the net worth of the contract in USDC (profit + money deposited)
    function getContractNetWorth() public view returns (uint256){
        uint256 totalCollateralBase = poolBalance();
        totalCollateralBase+=balanceOfToken[USDC];
        for(uint i=1;i<tokens.length;i++){
            totalCollateralBase+=(getEstimatedTokensOut(tokens[i],USDC,balanceOfToken[tokens[i]]));
        }
        return totalCollateralBase;
    }



    // get the maximum amount of money a user can withdraw (profit + money deposited)
    function MyMoney(address user)public view returns(uint256){
        uint256 maxMoney=(balances[user]*getContractNetWorth())/(totalInvestment);
        return maxMoney;
    } 


    // for the user to withdraw their money
    function withdraw(uint256 amount) public {
        uint256 maxMoney=(balances[msg.sender]*getContractNetWorth())/(totalInvestment);
        require(maxMoney >= amount, "Insufficient balance");
        require(amount>0,"Amount must be greater than zero");
        if(maxMoney>balanceOfToken[USDC]){
            revert("Not enough balance in contract");
        }
        stablecoin.transfer(msg.sender, amount);
        balances[msg.sender] -= amount;
        totalInvestment-=amount;
        balanceOfToken[USDC] -= amount;
        emit Withdrawn(msg.sender, amount);
    }
    

    function invest(uint256 amount) public {
        require(balanceOfToken[USDC]>= amount,"Not enough tokens");
        stablecoin.approve(address(Pool),amount);
        Pool.supply(address(stablecoin),amount, address(this),0);
        balanceOfToken[USDC] -= amount;
        emit Invested(msg.sender,amount);
    }

    // Invested amount in the liquidity pool of aave (profit + dpeosited money)
    function poolBalance() public view returns(uint256){
        uint256 totalCollateralBase;
        uint256 totalDebtBase;
        uint256 availableBorrowsBase;
        uint256 currentLiquidationThreshold;
        uint256 ltv;
        uint256 healthFactor;
        (totalCollateralBase,totalDebtBase,availableBorrowsBase,currentLiquidationThreshold,ltv,healthFactor)=Pool.getUserAccountData(address(this));
        return totalCollateralBase/100;
    }

    function withdrawInvest(uint256 amount) public{
        uint amountA;
        (amountA)=Pool.withdraw(address(stablecoin),amount,address(this));
        balanceOfToken[USDC]+=amountA;
        emit WithdrawInvestment(msg.sender, amountA);
    }

    // get the list of tokens in the contract
    function getTokens() public view returns(address[] memory){
        return tokens;
    }
}
