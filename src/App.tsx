import React, { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import './App.css';

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reward, setReward] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          // Get connected account
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            setAccount(accounts[0]);
          });
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.log('Please install MetaMask!');
      }
    };

    initWeb3();
  }, []);

  const handleRegisterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!web3) return;

    // Contract interaction will be implemented here
    console.log('Registering item:', { description, location, reward });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lost and Found DApp</h1>
        {account ? (
          <p>Connected Account: {account}</p>
        ) : (
          <p>Please connect your MetaMask wallet</p>
        )}
      </header>

      <main>
        <section className="register-item">
          <h2>Register Lost Item</h2>
          <form onSubmit={handleRegisterItem}>
            <div>
              <label>Description:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Item description"
                required
              />
            </div>
            <div>
              <label>Location:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Last known location"
                required
              />
            </div>
            <div>
              <label>Reward (ETH):</label>
              <input
                type="number"
                step="0.001"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="Reward amount in ETH"
                required
              />
            </div>
            <button type="submit">Register Item</button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
