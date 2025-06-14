# Crypto Tracker Roadmap

This document outlines the planned features and enhancements for the crypto portfolio tracker application.

## 🚀 Upcoming Features

### 1. Wallet Descriptions & Tags

**Priority: High**
**Status: Planned**

Add description/notes and tagging functionality to help users organize and remember wallet purposes.

#### Features:
- **Descriptions**: Rich text notes for each wallet
- **Tags**: Categorize wallets with custom tags (e.g., "trading", "defi", "cold-storage", "personal")
- **Tag Management**: Create, edit, delete, and assign colors to tags
- **Filtering**: Filter wallets by tags
- **Tag-based Analytics**: Portfolio breakdown by tag categories

#### Implementation Details:

- Add `description` and `tags` fields to the Address interface and database schema
- Create tag management system with CRUD operations
- Update AddAddressDialog to include description and tag selection
- Update EditAddressDialog to allow editing descriptions and tags
- Display description and tags in AddressCard component
- Add tag filtering in Header component
- Create TagManager component for tag administration

#### User Stories:

- As a user, I want to add descriptions to my wallets so I can remember their purpose
- As a user, I want to tag my wallets to organize them by category
- As a user, I want to filter my wallets by tags to focus on specific types
- As a user, I want to see portfolio summaries grouped by tags
- As a user, I want to manage my tags (create, edit, delete, assign colors)

#### Technical Tasks:

- [ ] Update `Address` interface to include `description` and `tags` fields
- [ ] Create `Tag` interface and tag management utilities
- [ ] Modify Supabase schema to add `description TEXT` and `tags JSONB` columns
- [ ] Create `useTags.ts` hook for tag CRUD operations
- [ ] Update `AddAddressDialog.tsx` to include description and tag fields
- [ ] Update `EditAddressDialog.tsx` to handle description and tag editing
- [ ] Create `TagSelector` component for tag selection UI
- [ ] Create `TagManager` component for tag administration
- [ ] Modify `AddressCard.tsx` to display description and tags
- [ ] Add tag filtering to `Header.tsx`
- [ ] Update `useAddresses.ts` hook to handle tags
- [ ] Update database conversion utilities in `lib/supabase.ts`

### 2. Portfolio Summary Dashboard

**Priority: High**
**Status: Planned**

Create a comprehensive summary view showing aggregated portfolio statistics across all wallets and chains.

#### Features:

- **Total Portfolio Value**: Combined USD value across all assets
- **Asset Breakdown**: Amount held per cryptocurrency (BTC, ETH, SOL, etc.)
- **Chain Distribution**: Portfolio allocation across different blockchains
- **Token Holdings**: Aggregated token balances (USDC, USDT, WETH, etc.)
- **Performance Metrics**: 24h change, portfolio growth trends
- **Visual Charts**: Pie charts for allocation, line charts for trends

#### Implementation Details:

- Create new `PortfolioSummary` component
- Add portfolio calculation utilities
- Integrate with price APIs (CoinGecko, CMC) for USD values
- Implement data aggregation functions
- Add responsive charts (recharts library)

#### User Stories:

- As a user, I want to see my total portfolio value at a glance
- As a user, I want to understand my asset allocation across different cryptocurrencies
- As a user, I want to track my portfolio performance over time
- As a user, I want to see aggregated token balances across all wallets

#### Technical Tasks:

- [ ] Create `PortfolioSummary.tsx` component
- [ ] Add price fetching utilities (`hooks/usePrices.ts`)
- [ ] Implement portfolio calculation functions (`lib/portfolio.ts`)
- [ ] Add chart dependencies (recharts)
- [ ] Create summary statistics calculations
- [ ] Design responsive dashboard layout
- [ ] Add USD value conversion utilities
- [ ] Implement portfolio performance tracking

#### UI/UX Considerations:

- **Placement**: Top of the page above address list (prominent position)
- **Layout**: Cards or sections for different metrics
- **Responsiveness**: Mobile-friendly grid layout
- **Loading States**: Skeleton loaders while calculating
- **Error Handling**: Graceful fallbacks for price API failures

### 3. Configurable Coin Support Dashboard

**Priority: High**
**Status: Planned**

Create an admin-style dashboard for managing supported cryptocurrencies and tokens without requiring code changes or database updates.

#### Features:
- **Coin Management Interface**: Add/remove supported coins through UI
- **Token Configuration**: Configure supported tokens for each blockchain
- **Dynamic Chain Support**: Enable/disable blockchain networks
- **Real-time Updates**: Changes apply immediately without app restart
- **Import/Export**: Bulk import coin lists, export configurations
- **Search & Discovery**: Search for coins by symbol, name, or contract address

#### Implementation Details:
- Create `CoinConfigDashboard` component with admin-style interface
- Store coin configurations in Supabase (separate from wallet data)
- Create `useCoins.ts` hook for dynamic coin management
- Update existing components to use dynamic coin lists
- Add coin validation and verification utilities
- Implement configuration caching for performance

#### User Stories:
- As a user, I want to add support for new cryptocurrencies without waiting for app updates
- As a user, I want to customize which tokens are tracked for each blockchain
- As a user, I want to enable/disable specific chains based on my needs
- As a user, I want to import popular coin lists or create custom ones
- As a user, I want to see real-time updates when I add new coin support

#### Technical Tasks:
- [ ] Create `coins` table in Supabase for dynamic coin configurations
- [ ] Create `Coin` and `TokenConfig` interfaces
- [ ] Build `CoinConfigDashboard.tsx` component
- [ ] Create `useCoins.ts` hook for coin CRUD operations
- [ ] Add coin search and validation utilities
- [ ] Update `types/index.ts` to use dynamic coin lists
- [ ] Modify existing components to consume dynamic configurations
- [ ] Add coin import/export functionality
- [ ] Implement configuration caching strategy
- [ ] Create coin verification and validation system
- [ ] Add popular coin list presets (top 100, DeFi tokens, etc.)

#### Database Schema:
```sql
-- Coins configuration table
CREATE TABLE coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  chain TEXT NOT NULL,
  contract_address TEXT,
  decimals INTEGER DEFAULT 18,
  logo_url TEXT,
  is_native BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_coins_chain ON coins(chain);
CREATE INDEX idx_coins_symbol ON coins(symbol);
CREATE UNIQUE INDEX idx_coins_chain_contract ON coins(chain, contract_address) WHERE contract_address IS NOT NULL;
```

## 🔮 Future Enhancements

### 4. Advanced Portfolio Features

**Priority: Medium**
**Status: Future**

- **Historical Tracking**: Store and display portfolio value over time
- **Alerts & Notifications**: Price alerts, balance change notifications
- **Advanced Analytics**: ROI calculations, profit/loss tracking
- **Export Functionality**: CSV/PDF portfolio reports
- **Portfolio Targets**: Set allocation targets and track deviation

### 5. Enhanced Wallet Management

**Priority: Medium**
**Status: Future**

- **Wallet Categories**: Group wallets by purpose (trading, DeFi, cold storage)
- **Favorite Wallets**: Pin important wallets to the top
- **Bulk Operations**: Refresh all balances, bulk delete
- **Wallet Templates**: Quick setup for common wallet types

### 6. Multi-Chain Improvements

**Priority: Low**
**Status: Future**

- **Additional Chains**: Avalanche, BSC, Cosmos, Cardano support
- **Cross-Chain Analytics**: Bridge transaction tracking
- **Chain-Specific Features**: Staking rewards, validator information
- **NFT Support**: Display NFT collections and values

### 7. User Experience Enhancements

**Priority: Low**
**Status: Future**

- **Dark/Light Mode**: Theme persistence and system preference
- **Keyboard Shortcuts**: Quick actions and navigation
- **Advanced Filtering**: Filter by balance, chain, date added
- **Search Functionality**: Search wallets by address, label, or description
- **Customizable Dashboard**: User-configurable layout and metrics

## 📋 Implementation Order

1. **Phase 1 (Current Sprint)**
   - Wallet descriptions & tags functionality
   - Basic portfolio summary dashboard
   - Configurable coin support dashboard

2. **Phase 2**
   - Advanced portfolio analytics with price integration
   - Tag-based filtering and portfolio breakdown
   - Enhanced coin management features

3. **Phase 3**
   - Historical tracking and performance metrics
   - Advanced analytics and export functionality
   - Portfolio alerts and notifications

4. **Phase 4**
   - Open source preparation and release
   - Additional blockchain support
   - Enhanced UX features and customization
   - Advanced wallet management tools

## 🌟 Open Source Preparation

**Priority: High**
**Status: After Core Features**

Prepare the project for open source release with proper documentation, setup guides, and community-friendly structure.

#### Requirements for Open Source Release:
- **Documentation**: Comprehensive README, setup guides, API documentation
- **Code Quality**: ESLint/Prettier configuration, TypeScript strict mode
- **Security**: Remove hardcoded secrets, environment variable documentation
- **License**: Choose appropriate open source license (MIT recommended)
- **Contributing Guidelines**: CONTRIBUTING.md with development setup
- **Issues Templates**: GitHub issue templates for bugs and features
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Demo/Screenshots**: Visual documentation of features
- **Architecture Documentation**: Technical overview for contributors

#### Technical Tasks:
- [ ] Create comprehensive README.md with setup instructions
- [ ] Add CONTRIBUTING.md with development guidelines
- [ ] Create LICENSE file (MIT recommended)
- [ ] Add GitHub issue and PR templates
- [ ] Set up GitHub Actions for CI/CD
- [ ] Add code quality tools (ESLint, Prettier, Husky)
- [ ] Create architecture documentation
- [ ] Add environment variable documentation
- [ ] Create demo deployment (Vercel/Netlify)
- [ ] Add screenshots and feature demos
- [ ] Security audit and cleanup
- [ ] Create developer onboarding guide

## 🛠 Technical Considerations

### Database Schema Changes

- Add `description` column to addresses table
- Consider adding `portfolio_snapshots` table for historical data
- Add indexes for performance optimization

### API Integrations

- CoinGecko API for cryptocurrency prices
- Rate limiting and caching strategies
- Error handling and fallback mechanisms

### Performance Optimizations

- Implement pagination for large wallet lists
- Add virtualization for token lists
- Optimize balance refresh strategies
- Cache portfolio calculations

### Security & Privacy

- Ensure no private keys are stored
- Implement proper input validation
- Add rate limiting for external API calls
- Consider data encryption for sensitive information

---

**Last Updated**: January 2025
**Next Review**: After Phase 1 completion
