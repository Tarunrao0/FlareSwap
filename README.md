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

#### Home Page
![image](https://github.com/user-attachments/assets/d365c907-b06b-42f5-a3e3-d07a2273d8dc)

### Create Pool 

![image](https://github.com/user-attachments/assets/27db9b0b-0b63-4609-aad3-972915566c14)
![image](https://github.com/user-attachments/assets/a28bd32c-fa9c-4113-8909-ad50918dc4c6)


### Pools 

![image](https://github.com/user-attachments/assets/b89867e9-8a8b-44b1-a610-e9abbeba5643)
![image](https://github.com/user-attachments/assets/37934370-a765-4f51-bfe8-c326999e2e63)
![image](https://github.com/user-attachments/assets/9b83c765-a992-473a-aa52-87ca438ee7b9)
