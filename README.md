# Crypto Portfolio Tracker 🚀

> A modern, multi-chain cryptocurrency portfolio tracker that allows you to monitor your digital assets across Bitcoin and Ethereum-based networks with a clean, privacy-first approach.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🌐 **Multi-Chain Support**: Bitcoin, Ethereum, Arbitrum, Polygon, Optimism, Base
- 📊 **Real-time Portfolio Dashboard**: Comprehensive overview with charts and analytics
- 💰 **Balance Tracking**: Fetch current balances and token holdings automatically
- 📋 **Transaction History**: View recent transactions across all supported networks
- 🕒 **Recent Transactions**: Cross-wallet transaction feed showing latest 20 transactions
- 🏷️ **Token Support**: Track popular tokens like USDC, USDT, WETH, ARB, and more
- 🎨 **Modern UI**: Clean interface built with Radix UI and Tailwind CSS
- 🔒 **Privacy-First**: Self-hosted solution - your data stays with you
- 🚀 **Demo Mode**: Try it out instantly with famous crypto addresses
- ⚡ **Rate Limit Handling**: Smart error handling with retry mechanisms
- 📱 **Responsive Design**: Works perfectly on desktop and mobile

## 🌐 Supported Networks

| Network | Symbol | Type | API Provider | Status |
|---------|--------|------|--------------|--------|
| Bitcoin | BTC | Native | mempool.space | ✅ Active |
| Ethereum | ETH | EVM | Alchemy | ✅ Active |
| Arbitrum | ETH | L2 | Alchemy | ✅ Active |
| Polygon | POL | L2 | Alchemy | ✅ Active |
| Optimism | ETH | L2 | Alchemy | ✅ Active |
| Base | ETH | L2 | Alchemy | ✅ Active |
| Solana | SOL | Native | Alchemy | ✅ Active |

## 🪙 Supported Tokens

### ERC-20 Tokens (Ethereum & L2s)
| Token | Symbol | Category |
|-------|--------|----------|
| USD Coin | USDC | Stablecoin |
| Tether | USDT | Stablecoin |
| Dai | DAI | Stablecoin |
| Wrapped Ethereum | WETH | Wrapped Asset |
| Wrapped Bitcoin | WBTC | Wrapped Asset |
| Wrapped Staked ETH | WSTETH | Liquid Staking |
| Staked Ether | stETH | Liquid Staking |
| Rocket Pool ETH | RETH | Liquid Staking |
| Chainlink | LINK | Oracle |
| Uniswap | UNI | DEX |
| Aave | AAVE | Lending |
| Curve DAO | CRV | DEX |
| Compound | COMP | Lending |
| Maker | MKR | Lending |
| Synthetix | SNX | Derivatives |
| 1inch | 1INCH | DEX Aggregator |
| Polygon | POL | L2 Native |
| Euler | EUL | Lending |
| Pendle | PENDLE | Yield Trading |
| Instadapp | INST | DeFi Infrastructure |
| Fluid | FLUID | DeFi Protocol |

### SPL Tokens (Solana)
| Token | Symbol | Category |
|-------|--------|----------|
| USD Coin | USDC | Stablecoin |
| Tether | USDT | Stablecoin |
| Wrapped Ethereum | WETH | Wrapped Asset |
| Wrapped Bitcoin | WBTC | Wrapped Asset |
| Wrapped SOL | SOL | Native Wrapped |
| Marinade SOL | mSOL | Liquid Staking |
| Lido Staked SOL | stSOL | Liquid Staking |
| BlazeStake SOL | bSOL | Liquid Staking |
| Jito Staked SOL | jitoSOL | Liquid Staking |
| Coinbase Wrapped BTC | cbBTC | Wrapped Asset |
| Jupiter | JUP | DEX |
| DUST Protocol | DUST | Gaming |
| Pyth Network | PYTH | Oracle |
| STEPN | GMT | Move-to-Earn |
| Orca | ORCA | DEX |
| Saber | SBR | Stableswap |

*Automatic token detection: The app automatically detects and displays any ERC-20/SPL tokens in your wallets, even if not listed above.*

## 🎯 Demo Mode

**Try it out instantly!** The app includes a demo mode with famous crypto addresses:

- **Vitalik Buterin** (Ethereum founder) - `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- **Coinbase CEO** - `0x503828976D22510aad0201ac7EC88293211D23Da`
- **Satoshi Era Wallet** - `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
- **DeFi Whale** - Large DeFi investor portfolio

Demo mode automatically activates when no API keys are configured, allowing you to explore all features with realistic data.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- (Optional) Alchemy API key for live Ethereum data

### ⚡ Quick Start

**Option 1: Try Demo Mode (No setup required)**
```bash
git clone https://github.com/your-username/portfolio-tracker.git
cd portfolio-tracker
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and click "Load Demo Addresses" to explore with sample data!

**Option 2: Full Setup with Live Data**

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/portfolio-tracker.git
   cd portfolio-tracker
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```

3. **Add your API keys** (edit `.env.local`):
   ```env
   # Required for live Ethereum/Solana data
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
   
   # Optional: Database persistence (Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the app**
   ```bash
   npm run dev
   ```

5. **Access the app**
   Open [http://localhost:3000](http://localhost:3000)

### 🔑 API Keys Setup

#### Alchemy API Key (Required for Live Data)

**What it enables:** Live balance and transaction data for Ethereum, Arbitrum, Polygon, Optimism, Base, and Solana networks.

1. **Create Account**: Visit [alchemy.com](https://alchemy.com) and sign up for free
2. **Create App**: 
   - Click "Create new app"
   - Choose "Ethereum" as chain (supports all EVM networks)
   - Select "Mainnet" network
   - Name your app (e.g., "Portfolio Tracker")
3. **Get API Key**: Copy your API key from the dashboard
4. **Add to Environment**: Paste into `NEXT_PUBLIC_ALCHEMY_API_KEY` in `.env.local`

**Free Tier**: 300M compute units/month (plenty for personal portfolio tracking)

**Networks Supported**: Ethereum, Arbitrum, Polygon, Optimism, Base, Solana

#### Supabase (Optional - for data persistence)

**What it enables:** Automatic backup of your wallet addresses and settings across devices.

1. **Create Project**: Visit [supabase.com](https://supabase.com) and create a new project
2. **Get Credentials**: 
   - Go to Settings → API
   - Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public key" → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Run Migrations**: Set up database tables with `npm run db:push`

**Without Supabase**: Wallet data is stored in browser localStorage only.

#### Running Supabase Migrations

After setting up Supabase credentials, create the required database tables:

```bash
# Push migrations to your Supabase instance
npm run db:push

# Alternative: Manual SQL execution
# Copy the SQL from supabase/migrations/ files and run in Supabase SQL Editor
```

**Available migration commands:**
- `npm run db:push` - Apply migrations to remote Supabase
- `npm run db:pull` - Pull schema changes from remote
- `npm run db:reset` - Reset local database  
- `npm run db:status` - Check connection status

## 📖 Usage Guide

### Adding Wallets
- Click the "Wallets" tab on the main page
- Click "Add Address" to input your wallet addresses
- Choose the appropriate blockchain network
- Add tags and descriptions for organization

### Portfolio Dashboard
- Switch to the "Dashboard" tab for comprehensive analytics
- View total portfolio value across all networks
- See individual token holdings and their USD values
- Track transaction history and portfolio changes

### Demo Mode Features
- Instant access to realistic portfolio data
- Explore all features without API setup
- Based on publicly known crypto addresses
- Perfect for screenshots, demos, and testing

## 🏗️ Architecture

This app is built with modern web technologies for optimal performance and developer experience:

### Tech Stack
- **Framework**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS with Radix UI primitives
- **State Management**: React Query for server state + React hooks for local state
- **Database**: Optional Supabase for data persistence
- **APIs**: Direct integration with blockchain providers

### Data Sources
| Provider | Networks | Rate Limits | Cost | Notes |
|----------|----------|-------------|------|-------|
| mempool.space | Bitcoin | Public API | Free | No API key required |
| Alchemy | Ethereum + L2s + Solana | 300M req/month | Free tier | Single API key for all networks |

**Bitcoin**: Uses public mempool.space API - works immediately without any setup
**Ethereum & L2s**: Requires Alchemy API key for live data  
**Solana**: Uses Alchemy's Solana RPC for balance and transaction data

### Key Components
- **AddressCard**: Individual wallet display with real-time balance updates
- **PortfolioSummary**: Comprehensive dashboard with analytics
- **RateLimitNotification**: Smart error handling for API limits
- **DemoBanner**: Demo mode indicator and controls

## 🛠️ Development

### Commands
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Project Structure
```
app/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configs
├── types/              # TypeScript type definitions
└── globals.css         # Global styles

components/ui/          # Reusable UI components (Radix UI)
```

## 🔒 Privacy & Security

This application is designed with privacy as a core principle:

### Your Data Stays Private
- ✅ **Self-hosted**: Run on your own infrastructure
- ✅ **Local storage**: Data stored in your browser or your own database
- ✅ **No tracking**: No analytics, no user tracking, no data collection
- ✅ **Open source**: Full transparency - audit the code yourself

### API Usage
- Only blockchain APIs (Alchemy, mempool.space) are contacted for balance data
- Your wallet addresses are only sent to these APIs to fetch balances
- No personal information is ever transmitted
- All API calls are made directly from your browser

### Security Best Practices
- Password protection for app access (optional)
- No sensitive data stored in browser local storage
- Environment variables for API keys
- Rate limiting protection

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push and create a PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Development Guidelines
- Use TypeScript for new components
- Follow the existing folder structure
- Test on multiple networks before submitting
- Keep commits atomic and well-described

## 📋 Roadmap

### Upcoming Features
- [ ] 🌟 **Solana Support**: Full Solana network integration
- [ ] 🔍 **Advanced Analytics**: Portfolio performance charts and metrics
- [ ] 📱 **Mobile App**: React Native companion app
- [ ] 🚨 **Price Alerts**: Custom notifications for portfolio changes
- [ ] 📊 **Export Tools**: CSV/PDF portfolio reports
- [ ] 🔗 **DeFi Integration**: Track LP positions and staking rewards

### Integrations Planned
- [ ] ENS (Ethereum Name Service) resolution
- [ ] NFT portfolio tracking
- [ ] Hardware wallet integration
- [ ] Multi-user support for families/teams

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⭐ Support

If you find this project helpful:
- Give it a star ⭐
- Share it with the crypto community
- Contribute to the codebase
- Report bugs and suggest features

---

**Built with ❤️ for the crypto community**
