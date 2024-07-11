require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "sepolia",
  paths: {
    sources: "./src",
  },
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/bcd60eb6cc0840bf8c6831f7e610fd36",
      accounts: [process.env.PRIVATE_KEY],
      gasLimit: 12000000,
    },
  },
};
