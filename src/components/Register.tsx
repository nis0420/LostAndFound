import React, { useState } from 'react';
import { Web3 } from 'web3';
import './Register.css';

interface RegisterProps {
  web3: Web3 | null;
  contract: any;
  account: string;
}

const Register: React.FC<RegisterProps> = ({ web3, contract, account }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reward, setReward] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
          gas: 300000
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
  );
};

export default Register;
