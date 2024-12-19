const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

// WARNING: Never commit these values to git!
const privateKey = '3e3389eaddcafbb5c00561f2d311af2ee0ff3a07c4a8445b5d20666dd0492701';
const infuraUrl = 'https://sepolia.infura.io/v3/c152c47f67904b708a078434add0a84c';

async function deploy() {
    try {
        // Setup provider
        const provider = new HDWalletProvider(privateKey, infuraUrl);
        const web3 = new Web3(provider);
        
        // Get the account
        const accounts = await web3.eth.getAccounts();
        console.log('Deploying from account:', accounts[0]);
        
        // Read and compile the contract
        const contractPath = path.join(__dirname, '../contracts/LostAndFound.sol');
        const source = fs.readFileSync(contractPath, 'utf8');
        
        // Prepare input for solc compiler
        const input = {
            language: 'Solidity',
            sources: {
                'LostAndFound.sol': {
                    content: source,
                },
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*'],
                    },
                },
            },
        };
        
        // Compile the contract
        console.log('Compiling contract...');
        const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
        const contract = compiledContract.contracts['LostAndFound.sol']['LostAndFound'];
        
        // Get contract data
        const abi = contract.abi;
        const bytecode = contract.evm.bytecode.object;
        
        // Save the ABI for frontend use
        fs.writeFileSync(
            path.join(__dirname, '../src/contracts/LostAndFound.json'),
            JSON.stringify({ abi, address: '' }, null, 2)
        );
        
        // Deploy the contract
        console.log('Deploying contract...');
        const deploy = new web3.eth.Contract(abi)
            .deploy({
                data: '0x' + bytecode,
                arguments: [],
            });
        
        const gas = await deploy.estimateGas();
        const result = await deploy.send({
            from: accounts[0],
            gas: gas,
        });
        
        console.log('Contract deployed at:', result.options.address);
        
        // Update the ABI file with the contract address
        const contractData = {
            abi,
            address: result.options.address,
        };
        fs.writeFileSync(
            path.join(__dirname, '../src/contracts/LostAndFound.json'),
            JSON.stringify(contractData, null, 2)
        );
        
        // Clean up
        provider.engine.stop();
        
        return result;
    } catch (error) {
        console.error('Error deploying contract:', error);
        throw error;
    }
}

// Run deployment
deploy();
