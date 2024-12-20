import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Web3 } from 'web3';
import './ItemDetails.css';

interface ItemDetailsProps {
  web3: Web3 | null;
  contract: any;
  account: string;
}

interface ItemData {
  id: string;
  description: string;
  location: string;
  reward: string;
  owner: string;
  isFound: boolean;
  finder: string;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ web3, contract, account }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [reportingFound, setReportingFound] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!contract || !id) return;

      try {
        const result = await contract.methods.getItem(id).call();
        setItem({
          id,
          description: result.description || result[1],
          location: result.location || result[2],
          reward: web3?.utils.fromWei(result.reward?.toString() || result[3]?.toString() || '0', 'ether') || '0',
          owner: result.owner || result[0],
          isFound: result.isFound || result[4],
          finder: result.finder || result[5]
        });
      } catch (err: any) {
        console.error('Error fetching item details:', err);
        setError('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [contract, id, web3]);

  const handleReportFound = async () => {
    if (!web3 || !contract || !account || !item) {
      setError('Please connect your wallet first');
      return;
    }

    setReportingFound(true);
    setError('');

    try {
      const claimFee = await contract.methods.claimFee().call();
      
      await contract.methods.reportFound(item.id).send({
        from: account,
        value: claimFee,
        gas: 300000
      });

      // Refresh item details
      const result = await contract.methods.getItem(id).call();
      setItem({
        ...item,
        isFound: true,
        finder: account
      });

    } catch (err: any) {
      console.error('Error reporting item as found:', err);
      setError(err.message || 'Error reporting item as found. Please try again.');
    } finally {
      setReportingFound(false);
    }
  };

  const handleClaimReward = async () => {
    if (!web3 || !contract || !account || !item) {
      setError('Please connect your wallet first');
      return;
    }

    if (account.toLowerCase() !== item.owner.toLowerCase()) {
      setError('Only the item owner can claim the reward');
      return;
    }

    setReportingFound(true);
    setError('');

    try {
      // This will transfer the reward amount to the finder's address
      await contract.methods.claimReward(item.id).send({
        from: account,
        gas: 300000
      });

      // Show success message
      alert(`Reward of ${item.reward} ETH has been sent to the finder (${item.finder})`);

      // Update item status
      const result = await contract.methods.getItem(id).call();
      setItem({
        ...item,
        isFound: true
      });

    } catch (err: any) {
      console.error('Error claiming reward:', err);
      setError(err.message || 'Error claiming reward. Please try again.');
    } finally {
      setReportingFound(false);
    }
  };

  if (loading) return <div className="loading">Loading item details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!item) return <div className="error">Item not found</div>;

  const isOwner = account.toLowerCase() === item.owner.toLowerCase();
  const canReportFound = !item.isFound && !isOwner;
  const canClaimReward = item.isFound && isOwner;

  return (
    <div className="item-details">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to List
      </button>

      <div className="item-card detailed">
        <h2>Item #{item.id}</h2>
        <div className="item-info">
          <p><strong>Description:</strong> {item.description}</p>
          <p><strong>Location:</strong> {item.location}</p>
          <p><strong>Reward:</strong> {item.reward} ETH</p>
          <p><strong>Status:</strong> {item.isFound ? 'Found' : 'Lost'}</p>
          <p className="owner"><strong>Reported by:</strong> {item.owner}</p>
          {item.isFound && item.finder !== '0x0000000000000000000000000000000000000000' && (
            <p className="finder"><strong>Found by:</strong> {item.finder}</p>
          )}
        </div>

        <div className="actions">
          {canReportFound && (
            <button 
              onClick={handleReportFound}
              disabled={reportingFound}
              className="report-found-button"
            >
              {reportingFound ? 'Processing...' : 'Report Found'}
            </button>
          )}

          {canClaimReward && (
            <button 
              onClick={handleClaimReward}
              disabled={reportingFound}
              className="claim-reward-button"
              title={`Click to send the reward of ${item.reward} ETH to the finder`}
            >
              {reportingFound ? 'Processing...' : `Send Reward to Finder (${item.reward} ETH)`}
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default ItemDetails;
