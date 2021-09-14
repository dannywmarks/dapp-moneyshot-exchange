require("babel-register");
require("babel-polyfill");
require("dotenv").config();

const privateKeys = process.env.PRIVATE_KEYS || "";
const HDWalletProvider = require("truffle-hdwallet-provider-privkey");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // match any network id
    },
    kovan: {
      provider: function () {
        return new HDWalletProvider(
          // Private Key
          privateKeys.split(","), // array of private keys
          // Url to an Etherum
          `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`
        );
      },
      network_id: 42,
      gas: 5000000,
      gasPrice: 25000000000,
    },
  },
  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis/",

  // Configure your compilers
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
