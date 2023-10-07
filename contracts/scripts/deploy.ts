import { ethers } from "hardhat";

// const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/1hwl8jpKitPSSAco4MBF-KQYgLY6Hwy4";
const RPC_URL = "https://eth-goerli.g.alchemy.com/v2/2PwQzqxejp-6sea6sRsT9ac7fYIQrBqM";

async function main() {
  const pk = process.env.PRIVATE_KEY;
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(pk as string, provider);
  const unicRegistry = await ethers.deployContract("UnicRegistry", wallet); 

  await unicRegistry.waitForDeployment();

  console.log(
    `UnicRegistry deployed to ${unicRegistry.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
