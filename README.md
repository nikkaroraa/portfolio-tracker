# Crypto Portfolio Tracker

A modern, multi-chain cryptocurrency portfolio tracker built with Next.js 15 and React 19. Track balances, tokens, and transaction history across Bitcoin and multiple Ethereum-based networks.

## Features

- **Multi-Chain Support**: Bitcoin, Ethereum, Arbitrum, Polygon, Optimism, Base
- **Real-time Balance Tracking**: Fetch current balances and token holdings
- **Transaction History**: View recent transactions across all supported networks
- **Token Support**: Track popular tokens like USDC, USDT, WETH, and more
- **Clean UI**: Modern interface built with Radix UI and Tailwind CSS
- **Self-Hosted**: Run your own instance for complete privacy

## Supported Networks

- **Bitcoin**: Balance and transaction data via mempool.space API
- **Ethereum Networks**: ETH, tokens, and transfers via Alchemy SDK
  - Ethereum Mainnet
  - Arbitrum
  - Polygon
  - Optimism
  - Base

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Alchemy API key (for Ethereum networks)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd portfolio-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:

   ```env
   # Required for Ethereum networks
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

   # Optional: For database persistence (requires Supabase setup)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting API Keys

#### Alchemy API Key (Required)

1. Sign up at [alchemy.com](https://alchemy.com)
2. Create a new app
3. Copy your API key to `NEXT_PUBLIC_ALCHEMY_API_KEY`

#### Supabase (Optional - for data persistence)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings → API
4. Run database migrations: `npm run db:push`

## Usage

1. **Add Wallet Addresses**: Click "Add Address" to input your wallet addresses
2. **Select Networks**: Choose which blockchain networks to track
3. **Refresh Balances**: Click refresh buttons to fetch latest data
4. **View Portfolio**: See your total portfolio value and individual holdings

## Architecture

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Data Fetching**: React Query for API state management
- **APIs**:
  - Bitcoin: mempool.space public API
  - Ethereum: Alchemy SDK
- **Database**: Optional Supabase integration for data persistence

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Privacy & Security

This is a **self-hosted** application designed for personal use. Your wallet addresses and portfolio data are:

- Stored locally or in your own database
- Never sent to third parties (except blockchain APIs for balance fetching)
- Completely under your control

## License

This project is open source and available under the [MIT License](LICENSE).

## Roadmap

- [ ] Solana network support
- [ ] Zcash integration
- [ ] Portfolio analytics and charts
- [ ] Price alerts
- [ ] Mobile responsive improvements
- [ ] Export functionality

## Support

If you find this project helpful, please consider giving it a star ⭐
