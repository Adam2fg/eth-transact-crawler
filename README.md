# Ethereum Transaction Crawler

A web application that allows users to view transaction data from the Ethereum blockchain for specific wallet addresses. The application displays transaction history and can show historical wallet balances at specific dates.

## Features

- View all transactions for a specific Ethereum wallet address
- Filter transactions from a specific starting block
- Check wallet balance at any historical date
- Transaction details include:
  - Timestamp
  - From/To addresses (with Etherscan links)
  - Transaction amount in ETH
- Real-time error handling and loading states
- Responsive design for all screen sizes

## Prerequisites

Before running this application, you need:

1. Node.js (v16 or higher)
2. An Infura account and API key
   - Sign up at [Infura](https://infura.io)
   - Create a new project
   - Get your project ID from the project settings

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```
   VITE_INFURA_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
   ```
   Replace `YOUR_INFURA_PROJECT_ID` with your actual Infura project ID.

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to the provided local URL

## How It Works

### Transaction Fetching
- The application connects to the Ethereum network through Infura's API
- When a wallet address is entered:
  1. Validates the Ethereum address format
  2. Starts from the specified block number (or defaults to 10,000 blocks from the current block)
  3. Iterates through blocks to find transactions involving the wallet
  4. Filters transactions where the wallet is either the sender or receiver
  5. Formats and displays the transaction data in a table

### Historical Balance Checking
- Uses binary search to efficiently find the closest block to a specified date
- Queries the wallet's balance at that specific block
- Displays the balance in ETH

### Technology Stack
- React for the UI
- Ethers.js for Ethereum interaction
- TailwindCSS for styling
- Vite for development and building
- TypeScript for type safety

## Error Handling

The application handles various error cases:
- Invalid Ethereum addresses
- Network connection issues
- Invalid block numbers
- API rate limiting

## Production Build

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Caution Notes

- The application uses the Ethereum mainnet by default
- For testing purposes, consider using a testnet (Goerli or Sepolia) by modifying the Infura URL
- Be mindful of API rate limits when querying large block ranges
- Transaction history is limited to protect against excessive API usage
