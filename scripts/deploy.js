const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

async function deploy() {
    try {
        // Connect to local network or provider
        const web3 = new Web3('YOUR_SEPOLIA_RPC_URL');
        
        // Add your account private key
        const privateKey = 'YOUR_PRIVATE_KEY';
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(account);
        
        // Read contract file
        const contractPath = path.join(__dirname, '../contracts/LostAndFound.sol');
        const source = fs.readFileSync(contractPath, 'utf8');
        
        // Compile contract
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
        
        // Deploy contract
        console.log('Deploying contract...');
        const contract = new web3.eth.Contract(abi);
        const deploy = contract.deploy({
            data: bytecode,
            arguments: [],
        });
        
        const gas = await deploy.estimateGas();
        const result = await deploy.send({
            from: account.address,
            gas: gas,
        });
        
        console.log('Contract deployed at:', result.options.address);
        return result;
    } catch (error) {
        console.error('Error deploying contract:', error);
        throw error;
    }
}

deploy();
