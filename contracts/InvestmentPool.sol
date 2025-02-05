// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InvestmentPool is Ownable {
    IERC20 public stablecoin = IERC20(0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8);
    IPool public uniswapRouter= IPool(0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951);

    mapping( address=> uint256) public balances;
    uint256 public totalPool;
    uint256 public totalInvestment;

    event Deposited(address indexed user, uint256 amount);

    event Invested(address indexed user, uint256 amount);

    event Withdrawn(address indexed ugser, uint256 amount);

    event WithdrawInvestment(address indexed user, uint256 amount);




    // Constructor that passes the initial owner to the Ownable constructor
    constructor( ) Ownable(msg.sender) {
        transferOwnership(msg.sender);  // Transfer ownership to the specified address
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        stablecoin.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        totalPool += amount;
        totalInvestment+=amount;
        emit Deposited(msg.sender, amount);
    }
    // function deposittoken(uint256 amount,address tokenAddress) external {
    //     require(amount > 0, "Amount must be greater than zero");
    //     IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
    //     balancetoken[msg.sender][tokenAddress] += amount;
    //     totalPooltoken[tokenAddress] += amount;
    //     emit Depositedtoken(msg.sender, amount,tokenAddress);
    // }
    function MyMoney(address user)public view returns(uint256){
        uint256 totalCollateralBase = getWithdrawalFromLiquidityPool();
        uint256 maxMoney=(balances[user]*totalCollateralBase)/(totalInvestment);
        return maxMoney;
    } 

    function withdraw(uint256 amount) external {
        uint256 totalCollateralBase = getWithdrawalFromLiquidityPool();
        totalCollateralBase+=totalPool;
        uint256 maxMoney=(balances[msg.sender]*totalCollateralBase)/(totalInvestment);
        require(maxMoney >= amount, "Insufficient balance");
        require(amount>0,"Amount must be greater than zero");
        if(maxMoney>totalPool){
            withdrawInvest(maxMoney-totalPool);
        }
        stablecoin.transfer(msg.sender, amount);
        balances[msg.sender] -= amount;
        totalInvestment-=amount;
        totalPool -= amount;
        emit Withdrawn(msg.sender, amount);
    }
    // function withdrawtoken(uint256 amount,address tokenAddress) external {
    //     IERC20(tokenAddress).transfer(msg.sender, amount);
    //     balancetoken[msg.sender][tokenAddress] -= amount;
    //     totalPooltoken[tokenAddress] -= amount;
    //     emit Withdrawntoken(msg.sender, amount,tokenAddress);
    // }


    function invest(uint256 amount) public {
        require(totalPool>= amount,"Not enough tokens");
        stablecoin.approve(address(uniswapRouter),amount);
        uniswapRouter.supply(address(stablecoin),amount, address(this),0);
        totalPool -= amount;
        emit Invested(msg.sender,amount);
    }


    function getWithdrawalFromLiquidityPool() public view returns(uint256){
        uint256 totalCollateralBase;
        uint256 totalDebtBase;
        uint256 availableBorrowsBase;
        uint256 currentLiquidationThreshold;
        uint256 ltv;
        uint256 healthFactor;
        (totalCollateralBase,totalDebtBase,availableBorrowsBase,currentLiquidationThreshold,ltv,healthFactor)=uniswapRouter.getUserAccountData(address(this));
        return totalCollateralBase/100;
    }
    // function investtoken(uint256 amount, address token) public {
    //     require(totalPool>= amount,"Not enough tokens");
    //     IERC20(token).approve(address(uniswapRouter),amount);
    //     uniswapRouter.supply(address(stablecoin),amount, address(this),0);
    //     investedtoken[token] += amount;
    //     totalPooltoken[token] -= amount;
    //     emit InvestedtokenEvent(msg.sender,amount,token);
    // }

    function withdrawInvest(uint256 amount) public{
        uint amountA;
        (amountA)=uniswapRouter.withdraw(address(stablecoin),amount,address(this));
        totalPool+=amountA;
        emit WithdrawInvestment(msg.sender, amountA);
    }

    // function withdrawInvesttoken(uint256 amount, address token) public{
    //     uint amountA;
    //     (amountA)=uniswapRouter.withdraw(address(stablecoin),amount,address(this));
    //     investedtoken[token]+=(amountA/10);
    //     investedtoken[token]-=amountA;
    //     totalPooltoken[token]+=amountA;
    //     emit WithdrawInvestmenttoken(msg.sender, amountA,token);
    // }

    function getData(address user) public view returns (uint256, uint256,uint256,uint256,uint256,uint256){
        uint256 totalCollateralBase;
        uint256 totalDebtBase;
        uint256 availableBorrowsBase;
        uint256 currentLiquidationThreshold;
        uint256 ltv;
        uint256 healthFactor;
        (totalCollateralBase,totalDebtBase,availableBorrowsBase,currentLiquidationThreshold,ltv,healthFactor)=uniswapRouter.getUserAccountData(user);
        return (totalCollateralBase,totalDebtBase,availableBorrowsBase,currentLiquidationThreshold,ltv,healthFactor);
    }
}
