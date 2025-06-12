# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm start` - Start production server

## Architecture Overview

This is a Next.js 15 crypto portfolio tracker that allows users to track balances across multiple blockchain networks. The app uses React 19 with TypeScript and is styled with Tailwind CSS.

### Core Structure

- **State Management**: Local React state in the main page component (`app/page.tsx`)
- **Data Fetching**: React Query for API calls, with custom hooks for each blockchain
- **UI Components**: Radix UI primitives with custom styling in `components/ui/`
- **Blockchain Integration**: Direct API calls to public endpoints (mempool.space for Bitcoin, Alchemy SDK for Ethereum networks)

### Key Data Flow

1. Addresses are stored in local state with balance, transaction history, and token data
2. Balance fetching is triggered manually via refresh buttons in the UI
3. Bitcoin uses mempool.space API, Ethereum networks use Alchemy SDK
4. Transaction history and token balances are fetched alongside main balance

### Supported Networks

- **Bitcoin**: Uses mempool.space API for balance and transaction data
- **Ethereum-based**: Uses Alchemy SDK supporting Mainnet, Arbitrum, Polygon, Optimism, Base
- **Future chains**: Solana and Zcash are defined in types but not implemented

### Environment Variables

- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Required for Ethereum network data fetching

### Custom Hooks

- `useBitcoinBalance`: Fetches Bitcoin balance and recent transactions
- `useEthereumBalance`: Fetches ETH balance, token balances, and transfers for EVM networks

### Component Architecture

- Main state lives in `app/page.tsx`
- `AddressCard` handles individual wallet display and balance refresh
- Dialog components for adding/editing addresses
- Address list with drag-and-drop reordering capability