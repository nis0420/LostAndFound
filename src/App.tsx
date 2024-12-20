import React, { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import contractData from './contracts/LostAndFound.json';
import Register from './components/Register';
import Home from './components/Home';
import ItemDetails from './components/ItemDetails';

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>('');
  const [contract, setContract] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          
          if (!mounted) return;
          setWeb3(web3Instance);
          
          // Get connected account
          const accounts = await web3Instance.eth.getAccounts();
          if (!mounted) return;
          setAccount(accounts[0]);

          // Initialize contract
          console.log('Initializing contract with address:', contractData.address);
          const contractInstance = new web3Instance.eth.Contract(
            contractData.abi,
            contractData.address
          );
          if (!mounted) return;
          setContract(contractInstance);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (mounted) setAccount(accounts[0]);
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } catch (error: any) {
          console.error("Initialization error:", error);
          if (mounted) {
            setError(error.message || "Failed to connect to wallet");
          }
        }
      } else {
        if (mounted) {
          setError('Please install MetaMask!');
        }
      }
    };

    initWeb3();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Lost and Found DApp</h1>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/register">Register Item</Link>
          </nav>
          {account ? (
            <p>Connected Account: {account}</p>
          ) : (
            <p>Please connect your MetaMask wallet</p>
          )}
          {error && <p className="error-message">{error}</p>}
        </header>

        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  web3={web3}
                  contract={contract}
                  account={account}
                />
              } 
            />
            <Route 
              path="/register" 
              element={
                <Register 
                  web3={web3}
                  contract={contract}
                  account={account}
                />
              } 
            />
            <Route 
              path="/item/:id" 
              element={
                <ItemDetails 
                  web3={web3}
                  contract={contract}
                  account={account}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
