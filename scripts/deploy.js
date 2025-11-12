const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Neural Salvage NFT Contract to Polygon...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");

  // Get platform wallet from env or use deployer
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS || deployer.address;
  console.log("🏦 Platform wallet:", platformWallet);

  // Deploy contract
  const NeuralSalvageNFT = await hre.ethers.getContractFactory("NeuralSalvageNFT");
  const contract = await NeuralSalvageNFT.deploy(
    deployer.address, // initial owner
    platformWallet    // platform wallet for royalties
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Neural Salvage NFT deployed to:", contractAddress);
  console.log("");
  console.log("📋 Contract Details:");
  console.log("   Name:", await contract.name());
  console.log("   Symbol:", await contract.symbol());
  console.log("   Owner:", await contract.owner());
  console.log("   Platform Wallet:", await contract.platformWallet());
  console.log("");
  console.log("🔗 View on PolygonScan:");
  
  const network = hre.network.name;
  if (network === "polygon") {
    console.log(`   https://polygonscan.com/address/${contractAddress}`);
  } else if (network === "polygonMumbai") {
    console.log(`   https://mumbai.polygonscan.com/address/${contractAddress}`);
  } else if (network === "polygonAmoy") {
    console.log(`   https://amoy.polygonscan.com/address/${contractAddress}`);
  }
  
  console.log("");
  console.log("🎨 OpenSea Collection:");
  if (network === "polygon") {
    console.log(`   https://opensea.io/assets/matic/${contractAddress}`);
  } else {
    console.log(`   https://testnets.opensea.io/assets/mumbai/${contractAddress}`);
  }
  
  console.log("");
  console.log("💾 Save this address to your .env file:");
  console.log(`   POLYGON_NFT_CONTRACT=${contractAddress}`);
  console.log("");
  
  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);
  
  console.log("✅ Deployment complete!");
  
  // Verify contract on PolygonScan (if API key is set)
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("");
    console.log("🔍 Verifying contract on PolygonScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address, platformWallet],
      });
      console.log("✅ Contract verified on PolygonScan");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
      console.log("   You can verify manually later");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
