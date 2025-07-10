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
- 🏷️ **Token Support**: Track popular tokens like USDC, USDT, WETH, ARB, and more
- 🎨 **Modern UI**: Clean interface built with Radix UI and Tailwind CSS
- 🔒 **Privacy-First**: Self-hosted solution - your data stays with you
- 🚀 **Demo Mode**: Try it out instantly with famous crypto addresses
- ⚡ **Rate Limit Handling**: Smart error handling with retry mechanisms
- 📱 **Responsive Design**: Works perfectly on desktop and mobile

## 🌐 Supported Networks

| Network | Symbol | Type | API Provider |
|---------|--------|------|--------------|
| Bitcoin | BTC | Native | mempool.space |
| Ethereum | ETH | EVM | Alchemy |
| Arbitrum | ARB | L2 | Alchemy |
| Polygon | MATIC | L2 | Alchemy |
| Optimism | OP | L2 | Alchemy |
| Base | BASE | L2 | Alchemy |

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
   # Required for live Ethereum data
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
   
   # Optional: Database persistence
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: App password protection
   CRYPTO_TRACKER_PASSWORD=your_secure_password
   ```

4. **Start the app**
   ```bash
   npm run dev
   ```

5. **Access the app**
   Open [http://localhost:3000](http://localhost:3000)

### 🔑 API Keys Setup

#### Alchemy API Key (Required for Live Data)

1. Visit [alchemy.com](https://alchemy.com) and create a free account
2. Create a new app and select your desired networks
3. Copy your API key to `NEXT_PUBLIC_ALCHEMY_API_KEY` in `.env.local`
4. Free tier includes 300M requests/month - perfect for personal use!

#### Supabase (Optional - for data persistence)

1. Visit [supabase.com](https://supabase.com) and create a project
2. Navigate to Settings → API to get your keys
3. Add to `.env.local` for automatic wallet data backup

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
| Provider | Networks | Rate Limits | Cost |
|----------|----------|-------------|------|
| mempool.space | Bitcoin | Public API | Free |
| Alchemy | Ethereum + L2s | 300M req/month | Free tier |

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
