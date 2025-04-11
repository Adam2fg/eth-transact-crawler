import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

function App() {
  const [address, setAddress] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_INFURA_URL);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      setTransactions([]);
      setBalance(null);

      if (!ethers.isAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }

      const startBlock = parseInt(blockNumber) || (await provider.getBlockNumber()) - 10000;
      const currentBlock = await provider.getBlockNumber();
      
      const txList: Transaction[] = [];

      for (let i = startBlock; i <= currentBlock; i += 1) {
        const block = await provider.getBlock(i, true);
        if (!block) continue;

        const blockTransactions = block.prefetchedTransactions.filter(
          tx => tx.from.toLowerCase() === address.toLowerCase() || 
               tx.to?.toLowerCase() === address.toLowerCase()
        );

        for (const tx of blockTransactions) {
          txList.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || '',
            value: ethers.formatEther(tx.value),
            timestamp: (await provider.getBlock(tx.blockNumber || 0))?.timestamp || 0
          });
        }
      }

      setTransactions(txList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getBalanceAtDate = async () => {
    try {
      setLoading(true);
      setError(null);
      setBalance(null);

      if (!date || !ethers.isAddress(address)) {
        throw new Error('Please provide both a valid address and date');
      }

      const targetTimestamp = new Date(date).getTime() / 1000;
      const currentBlock = await provider.getBlockNumber();
      
      // Binary search to find the closest block to the target timestamp
      let left = 1;
      let right = currentBlock;
      let closestBlock = right;
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const block = await provider.getBlock(mid);
        
        if (!block) continue;
        
        if (block.timestamp <= targetTimestamp) {
          closestBlock = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      const balance = await provider.getBalance(address, closestBlock);
      setBalance(ethers.formatEther(balance));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ethereum Transaction Crawler</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Block Number (optional)
              </label>
              <input
                type="number"
                value={blockNumber}
                onChange={(e) => setBlockNumber(e.target.value)}
                placeholder="e.g., 9000000"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <Search className="mr-2" size={20} />
            )}
            Fetch Transactions
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Balance at Date</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border rounded-md"
            />
            <button
              onClick={getBalanceAtDate}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              Get Balance
            </button>
          </div>
          {balance && (
            <p className="text-lg">
              Balance at {date}: <span className="font-semibold">{balance} ETH</span>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (ETH)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.hash}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(tx.timestamp * 1000, 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`https://etherscan.io/address/${tx.from}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`https://etherscan.io/address/${tx.to}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;