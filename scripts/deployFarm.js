async function deployContract(){

    const Test = await ethers.getContractFactory("Farm");

    console.log('\nDeploying Contract...')
    
    const TestContract = await Test.deploy(); 

    const tx = await TestContract.deploymentTransaction();
    
    console.log(`contract deployed successfully.\n`)
    console.log(`Transaction Hash: ${tx.hash}`)

    const address = await TestContract.getAddress()

    console.log(`Contract Address ${address}\n`);
}

// deploy the contract.
deployContract();