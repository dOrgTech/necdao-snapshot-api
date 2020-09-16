const TokenTimelock = artifacts.require("TokenTimelock");
const MockedTokenTimelock = artifacts.require("MockedTokenTimelock");
const ERC20 = artifacts.require("TestERC20");
const truffleAssert = require("truffle-assertions");

contract("TokenTimelock", async (accounts) => {
  const claimers = [accounts[0], accounts[2], accounts[5]];
  const rewards = [100, 200, 300];
  const from = accounts[8];
  const [
    rewardedAccount,
    notRewardedAccount,
    anotherRewardedAccount,
  ] = accounts;
  let token;
  let tokenTimeLock;
  let mockTokenTimeLock;

  let initialized = false;

  beforeEach(async () => {
    token = await ERC20.deployed();
    if (!initialized) await token.initialize("Reward Token", "REWARD");
    initialized = true;
    tokenTimeLock = await TokenTimelock.deployed();
    mockTokenTimeLock = await MockedTokenTimelock.deployed();
  });

  it("Attributes are correct", async () => {
    const tokenToLock = await tokenTimeLock.token();
    const releaseTime = await tokenTimeLock.releaseTime();
    // We need to convert to milliseconds because solidity works in seconds but javascript works in ms
    const releaseTimeInMs = releaseTime.valueOf().toNumber() * 10 ** 3
    const yearFromNowInMs = Date.now() + 31556952 * 10 ** 3;
    assert.equal(
      tokenToLock.valueOf(),
      token.address,
      "Token locked is not the same"
    );
    assert.isBelow(
      Date.now(),
      releaseTimeInMs,
      "Release time is higher than now"
    );
    assert.isBelow(
      releaseTime.valueOf().toNumber(),
      yearFromNowInMs,
      "Release time is less that a year from now"
    );
  });

  it("Add beneficiaries ", async () => {
    let newBeneficiary = await tokenTimeLock.beneficiary(claimers[0])
    assert.equal(newBeneficiary.valueOf().toNumber(), 0, "Beneficiary should not be added yet");
    await tokenTimeLock.addBeneficiaries(claimers, rewards, { from });
    newBeneficiary = await tokenTimeLock.beneficiary(claimers[0])
    assert.equal(newBeneficiary.valueOf().toNumber(), rewards[0], "Beneficiary should be added yet");
  })

  it("Dont allow release before release time", async () => {
    await truffleAssert.reverts(
      tokenTimeLock.release(rewardedAccount),
      "TokenTimelock: current time is before release time"
    );
  });

  it("Dont allow release to address that's not a claimer", async () => {
    await truffleAssert.reverts(
      tokenTimeLock.release(notRewardedAccount),
      "Claimer not registered on snapshot"
    );
  });

  it("Without time validation, it release the tokens", async () => {
    await mockTokenTimeLock.addBeneficiaries(claimers, rewards, { from });
    let rewardedAccountBalance = await token.balanceOf(rewardedAccount);
    assert.equal(
      rewardedAccountBalance.valueOf().toNumber(),
      0,
      "User should not have any tokens before release"
    );
    await mockTokenTimeLock.release(rewardedAccount);
    rewardedAccountBalance = await token.balanceOf(rewardedAccount);
    assert.equal(
      rewardedAccountBalance.valueOf().toNumber(),
      100,
      "User should have 100 tokens after release"
    );
  });

  it("When a claimer gets the reward, he wont be able to ask for it again", async () => {
    await mockTokenTimeLock.release(anotherRewardedAccount);
    await truffleAssert.reverts(
      mockTokenTimeLock.release(anotherRewardedAccount),
      "TokenTimelock: Claimer not registered on snapshot"
    );
  });
});
