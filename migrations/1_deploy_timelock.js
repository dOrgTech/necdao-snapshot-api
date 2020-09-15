const TestERC20 = artifacts.require("TestERC20");
const TokenTimelock = artifacts.require("TokenTimelock");
const MockTokenTimelock = artifacts.require("MockedTokenTimelock");

module.exports = async function(deployer, network, accounts) {
  const from = accounts[8]
  await deployer.deploy(TestERC20, { from });
  const erc20 = await TestERC20.deployed();
  const { address: timelockAddress } = await deployer.deploy(TokenTimelock, erc20.address, 31556952, { from });
  const { address: mockTimelockAddress } = await deployer.deploy(MockTokenTimelock, erc20.address, 31556952, { from });

  // Let's mint tokens for the timelock contracts
  await erc20.mint(timelockAddress, 600)
  await erc20.mint(mockTimelockAddress, 600)
};