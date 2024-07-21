# FlareSwap: A Decentralized Exchange Protocol

FlareSwap is a decentralized exchange (DEX) protocol that utilizes automated market makers (AMMs) to facilitate seamless token swaps between various pairs. In addition to enabling token swaps, FlareSwap allows users to create their own liquidity pools for any token pairs of their choice, ensuring flexibility and accessibility even if a desired pool doesn't already exist.


## Quick look at the backend

The smart contracts for this protocol are written in Solidity and utilize a Hardhat-Foundry setup. These contracts have undergone extensive testing using Foundry to ensure their reliability and performance. They are currently deployed on the Sepolia testnet.


### Usage

#### Build

```shell
$ forge build
```

#### Test

```shell
$ forge test
```

#### Coverage

```shell
$ forge coverage
```


#### Deploy

```shell
$ npx hardhat run script/deploy.js --network sepolia
```

### Frontend

The front end is built using Wagmi and NextJS. It also has a better-sqlite3 database to store all the pool addresses that were created. 

🎥 Video demonstration : `https://youtu.be/hgBCvz9OdFU` 

![image](https://github.com/user-attachments/assets/d365c907-b06b-42f5-a3e3-d07a2273d8dc)
