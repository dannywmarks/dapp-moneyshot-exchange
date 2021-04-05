const { default: Web3 } = require("web3");

const Token = artifacts.require("Token");
const Bar = artifacts.require("Bar");

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts()

  await deployer.deploy(Token);

  const feeAccount = accounts[0]
  const feePercent = 10
  
  await deployer.deploy(Bar, feeAccount, feePercent);
};
