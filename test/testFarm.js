const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Farm', function () {
  async function deployContractAndSetVariables() {
    // Deploy mock ERC20 tokens first
    const MockToken = await ethers.getContractFactory('MockERC20');
    const depositToken = await MockToken.deploy("Deposit Token", "DPST");
    const rewardToken = await MockToken.deploy("Reward Token", "RWRD");

    // Deploy the farm contract
    const Farm = await ethers.getContractFactory('Farm');
    const farm = await Farm.deploy(depositToken.getAddress(), rewardToken.getAddress());

    const [owner, user] = await ethers.getSigners();

    // Mint some tokens to the user
    const mintAmount = ethers.parseUnits('1000', 'ether');
    await depositToken.mint(user.address, mintAmount);
    await rewardToken.mint(user.address, mintAmount);

    return { farm, depositToken, rewardToken, owner, user, mintAmount };
  }

  it('should deploy with correct token addresses', async function () {
    const { farm, depositToken, rewardToken } = await loadFixture(deployContractAndSetVariables);

    expect(await farm.depositTokenAddress()).to.equal(await depositToken.getAddress());
    expect(await farm.rewardTokenaddress()).to.equal(await rewardToken.getAddress());
  });

  it('should allow users to deposit tokens', async function () {
    const { farm, depositToken, user } = await loadFixture(deployContractAndSetVariables);
    const depositAmount = ethers.parseUnits('100', 'ether');

    // Approve farm to spend tokens
    await depositToken.connect(user).approve(await farm.getAddress(), depositAmount);

    // Deposit tokens
    await farm.connect(user).depossit(depositAmount);

    // Check balance
    expect(await farm.balances(user.address)).to.equal(depositAmount);
  });

  it('should track time of last deposit', async function () {
    const { farm, depositToken, user } = await loadFixture(deployContractAndSetVariables);
    const depositAmount = ethers.parseUnits('100', 'ether');

    await depositToken.connect(user).approve(await farm.getAddress(), depositAmount);
    await farm.connect(user).depossit(depositAmount);

    const blockTimestamp = (await ethers.provider.getBlock('latest')).timestamp;
    expect(await farm.timeOfLastDeposit(user.address)).to.equal(blockTimestamp);
  });

  it('should calculate and transfer correct reward amount', async function () {
    const { farm, depositToken, rewardToken, user } = await loadFixture(deployContractAndSetVariables);
    const depositAmount = ethers.parseUnits('100', 'ether');

    // Approve and deposit
    await depositToken.connect(user).approve(await farm.getAddress(), depositAmount);
    await farm.connect(user).depossit(depositAmount);

    // Increase time by 1 hour
    await ethers.provider.send('evm_increaseTime', [3600]);
    await ethers.provider.send('evm_mine');

    // Approve reward token spending
    const expectedReward = depositAmount * BigInt(3600) * BigInt(100);
    await rewardToken.connect(user).approve(await farm.getAddress(), expectedReward);

    // Harvest rewards
    await farm.connect(user).harvest();

    // Check reward token balance
    expect(await rewardToken.balanceOf(await farm.getAddress())).to.equal(expectedReward);
  });
});