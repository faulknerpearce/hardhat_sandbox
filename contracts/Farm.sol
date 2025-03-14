// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Farm {

    address depositTokenAddress;
    address rewardTokenaddress;

    mapping(address user => uint balance ) public balances;
    mapping(address user => uint time) public timeOfLastDeposit;
    
    // constructor to initialize the contract with the address of the deposit token and reward token.
    constructor (address _depositTokenAddress, address _rewardTokenaddress) {
        depositTokenAddress = _depositTokenAddress;
        rewardTokenaddress = _rewardTokenaddress;
    }

    // function to deposit tokens, this function will be called by the user.
    function depossit(uint amount ) external {
        IERC20 token = IERC20(depositTokenAddress);
        token.transfer(address(this), amount);
        balances[msg.sender] += amount;
        timeOfLastDeposit[msg.sender] = block.timestamp;
    }
    
    // function to withdraw tokens, this function will be called by the user.
    function harvest() external {

        uint depositBalance = balances[msg.sender];
        uint rate = 100;
        uint timePassed = block.timestamp - timeOfLastDeposit[msg.sender];
        uint amount = timePassed * rate * depositBalance;

        IERC20 rewardToken = IERC20(rewardTokenaddress);

        rewardToken.transferFrom(msg.sender, address(this), amount);
    }

    // function to withdraw deposit tokens, this function will be called by the user.


}