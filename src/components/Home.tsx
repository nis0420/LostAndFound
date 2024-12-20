import React, { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import './Home.css';

interface HomeProps {
  web3: Web3 | null;
  contract: any;
  account: string;
}

interface LostItem {
  id: string;
  description: string;
  location: string;
  reward: string;
  owner: string;
  isFound: boolean;
  finder: string;
}

const Home: React.FC<HomeProps> = ({ web3, contract, account }) => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchLostItems = async () => {
      if (!contract) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching item count...');
        const itemCount = await contract.methods.itemCount().call();
        console.log('Item count:', itemCount);
        
        const items: LostItem[] = [];

        for (let i = 1; i <= itemCount; i++) {
          console.log(`Fetching item ${i}...`);
          try {
            const result = await contract.methods.getItem(i).call();
            console.log(`Item ${i} data:`, result);
            
            items.push({
              id: i.toString(),
              description: result.description || result[1],
              location: result.location || result[2],
              reward: web3?.utils.fromWei(result.reward?.toString() || result[3]?.toString() || '0', 'ether') || '0',
              owner: result.owner || result[0],
              isFound: result.isFound || result[4],
              finder: result.finder || result[5]
            });
          } catch (itemError) {
            console.error(`Error fetching item ${i}:`, itemError);
          }
        }

        setLostItems(items);
        setLoading(false);
      } catch (err: any) {
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          data: err.data
        });
        setError(`Failed to load lost items: ${err.message}`);
        setLoading(false);
      }
    };

    fetchLostItems();
  }, [web3, contract, account]);

  if (loading) return <div className="loading">Loading lost items...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!contract) return <div className="error">Please connect your wallet to view lost items.</div>;

  return (
    <div className="home-container">
      <h2>Lost Items</h2>
      {lostItems.length === 0 ? (
        <p>No lost items reported yet.</p>
      ) : (
        <div className="items-grid">
          {lostItems.map((item) => (
            <div key={item.id} className="item-card">
              <h3>Item #{item.id}</h3>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Reward:</strong> {item.reward} ETH</p>
              <p><strong>Status:</strong> {item.isFound ? 'Found' : 'Lost'}</p>
              <p className="owner"><strong>Reported by:</strong> {item.owner}</p>
              {item.isFound && item.finder !== '0x0000000000000000000000000000000000000000' && (
                <p className="finder"><strong>Found by:</strong> {item.finder}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
