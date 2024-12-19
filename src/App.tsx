import React, { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import './App.css';
import contractData from './contracts/LostAndFound.json';

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
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

          // Initialize contract
          const contractInstance = new web3Instance.eth.Contract(
            contractData.abi,
            contractData.address
          );
          setContract(contractInstance);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            setAccount(accounts[0]);
          });
        } catch (error) {
          console.error("User denied account access");
          setError("Please connect your MetaMask wallet");
        }
      } else {
        setError('Please install MetaMask!');
      }
    };

    initWeb3();
  }, []);

  const handleRegisterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!web3 || !contract || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const registrationFee = await contract.methods.registrationFee().call();
      const rewardInWei = web3.utils.toWei(reward, 'ether');

      await contract.methods.registerItem(description, location, rewardInWei)
        .send({
          from: account,
          value: registrationFee,
          gas: 300000 // Gas limit
        });

      // Clear form after successful registration
      setDescription('');
      setLocation('');
      setReward('');
      
      alert('Item registered successfully!');
    } catch (err: any) {
      console.error('Error registering item:', err);
      setError(err.message || 'Error registering item. Please try again.');
    } finally {
      setLoading(false);
    }
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
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleRegisterItem}>
            <div>
              <label>Description:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Item description"
                required
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register Item'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
