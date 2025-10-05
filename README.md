# Web3 Raffle DApp

A decentralized lottery application built on Ethereum, featuring provably fair random winner selection using Chainlink VRF and automated draw execution via Chainlink Automation.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Testing the Full Flow](#testing-the-full-flow)
- [How It Works](#how-it-works)
- [Smart Contract Details](#smart-contract-details)
- [Frontend Architecture](#frontend-architecture)
- [Deployment](#deployment)

---

## 🎯 Overview

This is a full-stack decentralized raffle/lottery application where:
- Players enter by paying an entrance fee in ETH
- A winner is randomly selected after a set time interval
- The winner receives the entire prize pool automatically
- Everything is provably fair and transparent on the blockchain

**Live Demo on Sepolia**: [Contract Address: `0x452c901abd4f44e64C745F58Ee616c31aC9b9E74`]

---

## 🛠 Tech Stack

### Backend (Smart Contracts)
- **Solidity** `^0.8.28` - Smart contract language
- **Hardhat** - Development environment
- **Hardhat Ignition** - Deployment framework
- **Ethers.js v6** - Ethereum library
- **Mocha & Chai** - Testing framework
- **Chainlink VRF v2.5** - Verifiable random function
- **Chainlink Automation** - Automated upkeep

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Wagmi v2** - React hooks for Ethereum
- **Viem v2** - TypeScript Ethereum library
- **RainbowKit v2** - Wallet connection UI
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

---

## 🚀 Installation

### 1. Clone the Repository (frontend)

```bash
git clone https://github.com/CodeEnthusiast09/hardhat-lottery-frontend-nextjs.git
cd hardhat-lottery-frontend-nextjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Clone the Repository (backend)

```bash
cgit clone https://github.com/CodeEnthusiast09/hardhat-lottery.git
cd hardhat-lottery
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Environment Variables

**Backend (`.env` in root):**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_ENABLE_TESTNETS= can_either_be _true_or_false (depending on if you want to enable testnet or not)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

Get your WalletConnect Project ID from: https://dashboard.reown.com/

---

## 🏃 Running Locally

### Step 1: Start Hardhat Node

In the backend's **root directory**, run:

```bash
npx hardhat node
```

This starts a local Ethereum network on `http://127.0.0.1:8545`. Keep this terminal running.

### Step 2: Deploy Smart Contracts

Open a **new terminal** in the root directory:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Important**: Copy the deployed Raffle contract address from the output.

### Step 3: Update Frontend Configuration

Open `frontend/src/lib/contracts.ts` and update the Hardhat address:

```typescript
const CONTRACT_ADDRESSES = {
  11155111: "0x452c901abd4f44e64C745F58Ee616c31aC9b9E74", // Sepolia
  31337: "0xYOUR_DEPLOYED_ADDRESS_HERE", // Update this!
}
```

### Step 4: Configure MetaMask for Hardhat

Add Hardhat network to MetaMask:
- **Network Name**: Hardhat Local
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
- **Currency Symbol**: ETH

Import a test account from Hardhat (use one of the private keys shown in the Hardhat node terminal).

### Step 5: Start Frontend

In a **new terminal**, navigate to frontend directory:

Open `http://localhost:3000` in your browser.

---

## 🧪 Testing the Full Flow

---

### Manual Testing Flow

1. **Connect Wallet**
   - Click "Connect Wallet" in the UI
   - Select MetaMask and connect

2. **Enter the Raffle**
   - Click "Enter Raffle" button
   - Confirm the transaction in MetaMask
   - Wait for confirmation (you'll see "Already Entered")

3. **Enter with Multiple Accounts** (Optional)
   - Switch to a different account in MetaMask
   - Enter the raffle with 2-3 different accounts
   - This increases the prize pool

4. **Wait for Countdown**
   - Watch the countdown timer (default: 5 minutes for local testing)
   - The timer shows time remaining until the draw

5. **Trigger the Draw** (Since Chainlink Automation won't work locally)
   
   **Run your mock upkeep script**
   
   ---
   
   ```bash
   npx hardhat run scripts/mock-offchain.ts --network localhost
   ```

   **Option B**: Manually call performUpkeep
   ```bash
   # In Hardhat console
   npx hardhat console --network localhost
   
   # Then run:
   const Raffle = await ethers.getContractFactory("Raffle");
   const raffle = await Raffle.attach("YOUR_CONTRACT_ADDRESS");
   await raffle.performUpkeep("0x");
   ```

6. **Verify Winner**
   - Refresh the frontend
   - Check "Recent Winner" section
   - The winner's address should appear
   - Winner's wallet balance increases by the prize pool amount

7. **New Round Starts**
   - Timer resets automatically
   - Prize pool resets to 0
   - You can enter the new round

---

## 📖 How It Works

### User Flow

```
1. User connects wallet
2. User pays entrance fee (e.g., 0.1 ETH) to enter
3. User added to players array
4. Countdown timer shows time remaining
5. When timer reaches 00:00:
   - Chainlink Automation calls checkUpkeep()
   - If conditions met, calls performUpkeep()
   - Contract requests random number from Chainlink VRF
   - VRF returns random number
   - Random number used to select winner
   - Winner receives entire prize pool
   - New round starts automatically
```

### Smart Contract Logic

**Entry Requirements:**
- Must pay at least the entrance fee
- Raffle must be in OPEN state

**Draw Conditions (all must be true):**
- Time interval has passed
- Raffle state is OPEN
- At least 1 player entered
- Contract has ETH balance

**Winner Selection:**
```solidity
// Provably fair random selection
uint256 indexOfWinner = randomWords[0] % s_players.length;
address payable winner = s_players[indexOfWinner];
```

---

## 🔐 Smart Contract Details

### Constructor Parameters

```solidity
constructor(
    address vrfCoordinator,      // Chainlink VRF Coordinator
    uint256 subscriptionId,      // VRF subscription ID
    bytes32 gasLane,             // VRF gas lane (key hash)
    uint256 interval,            // Time between draws (seconds)
    uint256 entranceFee,         // Entry fee in wei
    uint32 callbackGasLimit      // Gas limit for VRF callback
)
```

### Key Functions

**For Players:**
- `enterRaffle()` - Enter the raffle by paying entrance fee
- `getEntranceFee()` - Get the entry fee amount
- `getNumberOfPlayers()` - Get current player count
- `getRaffleState()` - Check if raffle is open (0) or calculating (1)

**For Automation:**
- `checkUpkeep()` - Checks if draw conditions are met
- `performUpkeep()` - Triggers winner selection process

**View Functions:**
- `getPlayer(uint256 index)` - Get player address by index
- `getRecentWinner()` - Get last winner's address
- `getLastTimeStamp()` - Get timestamp of last draw
- `getInterval()` - Get time interval between draws

---

## 🎨 Frontend Architecture

### Custom Hooks

**`useRaffleData`** - Fetches all contract data
- Entrance fee
- Number of players
- Recent winner
- Raffle state
- Timestamps and intervals

**`useCountdown`** - Manages countdown timer
- Calculates time remaining
- Updates every second
- Handles edge cases (no data, expired)

**`usePlayers`** - Fetches list of entered players
- Iterates through player array
- Checks if current user entered

### State Management

- **Wagmi** - Manages wallet connection and contract reads
- **TanStack Query** - Caches and refetches data
- **React State** - UI state and derived data

### Network Detection

The app automatically detects which network you're connected to and uses the appropriate contract address.

---

## 🌐 Deployment

### Deploy to Sepolia Testnet

1. **Get Sepolia ETH**
   - Use [Sepolia Faucet](https://sepoliafaucet.com/)

2. **Set up Chainlink VRF Subscription**
   - Go to [Chainlink VRF](https://vrf.chain.link/)
   - Create a subscription
   - Fund it with LINK tokens
   - Get your subscription ID

3. **Update Configuration**
   ```typescript
   // In helper-hardhat.config.ts
   11155111: {
     subscriptionId: "YOUR_SUBSCRIPTION_ID",
     vrfCoordinatorV2_5: "0x...",
     // ... other config
   }
   ```

4. **Deploy**
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

5. **Add Contract to VRF Subscription**
   - Add your deployed contract address as a consumer in Chainlink VRF dashboard

6. **Set up Chainlink Automation**
   - Go to [Chainlink Automation](https://automation.chain.link/)
   - Register new upkeep
   - Select "Custom logic"
   - Add your contract address
   - Fund the upkeep with LINK

---

**Happy Raffling!** 🎰
