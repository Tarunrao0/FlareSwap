const { ethers } = require("hardhat");

require("dotenv").config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const providerUrl = `https://sepolia.infura.io/v3/${process.env.API_KEY}`;
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const ownerWallet = new ethers.Wallet(privateKey, provider);
  const ownerAddress = ownerWallet.address;

  console.log("Owner:", ownerAddress);

  try {
    /** DEPLOYING ALL THE MOCK ERC-20s */
    const MockUSDC = await ethers.getContractFactory("mockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.deployed();
    const usdcAddress = mockUsdc.address;
    console.log("MockUSDC deployed at:", usdcAddress);

    const MockWETH = await ethers.getContractFactory("mockWETH");
    const mockWeth = await MockWETH.deploy();
    await mockWeth.deployed();
    const wethAddress = mockWeth.address;
    console.log("MockWETH deployed at:", wethAddress);

    const MockAAVE = await ethers.getContractFactory("mockAAVE");
    const mockAAVE = await MockAAVE.deploy();
    await mockAAVE.deployed();
    const aaveAddress = mockAAVE.address;
    console.log("MockAAVE deployed at:", aaveAddress);

    const MockDAI = await ethers.getContractFactory("mockDAI");
    const mockDAI = await MockDAI.deploy();
    await mockDAI.deployed();
    const daiAddress = mockDAI.address;
    console.log("MockDAI deployed at:", daiAddress);

    /** LIQUIDITY POOL TOKEN 🌊 */
    const Flare = await ethers.getContractFactory("Flare");
    const flare = await Flare.deploy(ownerAddress);
    await flare.deployed();
    const flareAddress = flare.address;
    console.log("Flare deployed at:", flareAddress);

    /** DEPLOYING THE FACTORY 🏭 */
    const Factory = await ethers.getContractFactory("PoolDeployer");
    const factory = await Factory.deploy(ownerAddress, flareAddress);
    await factory.deployed();
    const factoryAddress = factory.address;
    console.log("Factory deployed at:", factoryAddress);

    console.log("Authorizing factory 🌪️");
    await flare.connect(ownerWallet).authorizeContract(factoryAddress);
    console.log("Authorized 🦄");

    /**MINT TOKENS FOR TESTING */
    const mintUSDCTx = await mockUsdc.mint(
      ownerAddress,
      ethers.utils.parseEther("1000000")
    );
    await mintUSDCTx.wait();

    console.log("usdc minted");

    const mintWETHTx = await mockWeth.mint(
      ownerAddress,
      ethers.utils.parseEther("1000000")
    );
    await mintWETHTx.wait();

    console.log("weth minted");

    const mintAAVETx = await mockAAVE.mint(
      ownerAddress,
      ethers.utils.parseEther("1000000")
    );
    await mintAAVETx.wait();

    console.log("aave minted");

    const mintDAITx = await mockDAI.mint(
      ownerAddress,
      ethers.utils.parseEther("1000000")
    );
    await mintDAITx.wait();

    console.log("dai minted");
  } catch (error) {
    console.error("Error deploying contracts:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error in main function:", error);
  process.exit(1);
});
