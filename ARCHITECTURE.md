# 🏗 Architecture Documentation

## System Overview

Торговый бот состоит из трех основных компонентов:

1. **Frontend** - React SPA для управления и мониторинга
2. **Backend** - NestJS API сервер с бизнес-логикой
3. **Database** - PostgreSQL для хранения данных

## Technology Stack

### Backend Stack
```
NestJS (Framework)
├── TypeORM (ORM)
├── PostgreSQL (Database)
├── Socket.io (WebSocket)
├── Bybit-API (Exchange Integration)
├── OpenAI (AI Decision Making)
├── TechnicalIndicators (Market Analysis)
└── Class-Validator (Validation)
```

### Frontend Stack
```
React 19
├── TypeScript
├── Vite (Build Tool)
├── TailwindCSS (Styling)
├── React Router (Routing)
├── Chart.js (Visualization)
├── Socket.io-client (Real-time)
└── Axios (HTTP Client)
```

## Architecture Layers

### 1. Presentation Layer (Frontend)

```
src/
├── components/
│   ├── Dashboard/         # Main dashboard components
│   │   ├── Dashboard.tsx       # Main page
│   │   ├── BalanceCard.tsx     # Account balance
│   │   ├── PositionsCard.tsx   # Open positions
│   │   ├── TradesTable.tsx     # Trade history
│   │   ├── StatsCard.tsx       # Statistics
│   │   └── PriceChart.tsx      # Price charts
│   └── Strategy/          # Strategy management
│       └── StrategyManager.tsx # Strategy CRUD
├── services/
│   └── api.ts            # API client
├── hooks/
│   └── useWebSocket.ts   # WebSocket hook
└── App.tsx               # Main app component
```

### 2. Application Layer (Backend)

```
src/
├── modules/
│   ├── bybit/            # Bybit integration
│   │   ├── bybit.service.ts       # API calls
│   │   ├── bybit.controller.ts    # REST endpoints
│   │   └── bybit.module.ts        # Module config
│   ├── strategy/         # Trading strategies
│   │   ├── strategy.service.ts    # Indicator calculations
│   │   ├── strategy.controller.ts # Strategy CRUD
│   │   ├── strategy.entity.ts     # Strategy model
│   │   └── strategy.module.ts     # Module config
│   ├── ai/               # AI decision making
│   │   ├── ai.service.ts          # OpenAI integration
│   │   └── ai.module.ts           # Module config
│   ├── trade/            # Trade execution
│   │   ├── trade.service.ts       # Trading logic
│   │   ├── trade.controller.ts    # Trade endpoints
│   │   ├── trade.entity.ts        # Trade model
│   │   └── trade.module.ts        # Module config
│   └── websocket/        # Real-time updates
│       ├── websocket.gateway.ts   # Socket.io gateway
│       └── websocket.module.ts    # Module config
├── app.module.ts         # Main module
└── main.ts              # Application entry
```

### 3. Data Layer (Database)

```sql
-- Strategies table
CREATE TABLE strategies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50),
    is_active BOOLEAN,
    symbols TEXT[],
    timeframe VARCHAR(10),
    risk_percentage DECIMAL(5,2),
    max_positions INTEGER,
    stop_loss_percentage DECIMAL(5,2),
    take_profit_percentage DECIMAL(5,2),
    use_ai_confirmation BOOLEAN,
    min_ai_confidence INTEGER,
    indicators JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Trades table
CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50),
    side VARCHAR(10),
    quantity DECIMAL(20,8),
    price DECIMAL(20,8),
    order_id VARCHAR(100),
    confidence INTEGER,
    reasoning TEXT,
    status VARCHAR(20),
    exit_price DECIMAL(20,8),
    realized_pnl DECIMAL(20,8),
    created_at TIMESTAMP,
    executed_at TIMESTAMP,
    closed_at TIMESTAMP
);
```

## Data Flow

### Trading Cycle

```
┌──────────────────────────────────────────────────────────┐
│ 1. CRON JOB (Every minute)                               │
│    TradeService.runActiveStrategies()                    │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 2. GET MARKET DATA                                       │
│    BybitService.getKlineData(symbol, interval, 200)      │
│    Returns: Historical candlestick data                  │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 3. CALCULATE INDICATORS                                  │
│    StrategyService.calculateIndicators(marketData)       │
│    Returns: { rsi, emaShort, emaLong, macd, bollinger } │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 4. GET STRATEGY SIGNAL                                   │
│    StrategyService.analyzeScalpingStrategy(indicators)   │
│    Returns: "LONG" | "SHORT" | "HOLD"                    │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 5. AI CONFIRMATION (if enabled)                          │
│    AiService.getTradeDecision(symbol, price, indicators) │
│    Returns: { action, confidence, reasoning, riskLevel } │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 6. RISK CHECKS                                           │
│    - Check AI confidence >= minAiConfidence              │
│    - Check open positions < maxPositions                 │
│    - Calculate position size based on risk %             │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 7. EXECUTE ORDER                                         │
│    BybitService.placeOrder(symbol, side, qty)            │
│    BybitService.setStopLoss(symbol, side, stopLoss)      │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 8. SAVE TRADE                                            │
│    tradeRepo.save(tradeData)                             │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 9. NOTIFY FRONTEND                                       │
│    WebsocketGateway.sendTradeExecuted(tradeData)         │
└──────────────────────────────────────────────────────────┘
```

### Real-time Updates Flow

```
Backend                    WebSocket                   Frontend
   │                          │                           │
   │ Market Update            │                           │
   ├─────────────────────────>│                           │
   │                          │ marketUpdate event        │
   │                          ├──────────────────────────>│
   │                          │                           │ Update UI
   │                          │                           ├──────────┐
   │                          │                           │          │
   │ Trade Executed           │                           │<─────────┘
   ├─────────────────────────>│                           │
   │                          │ tradeExecuted event       │
   │                          ├──────────────────────────>│
   │                          │                           │ Show notification
   │                          │                           ├──────────┐
   │ Balance Update           │                           │          │
   ├─────────────────────────>│                           │<─────────┘
   │                          │ balanceUpdate event       │
   │                          ├──────────────────────────>│
   │                          │                           │ Update balance card
```

## Service Responsibilities

### BybitService
- REST API calls to Bybit
- WebSocket subscriptions
- Order management (place, cancel, modify)
- Position management
- Balance queries
- Historical data retrieval

### StrategyService
- Technical indicator calculations
  - RSI (Relative Strength Index)
  - EMA (Exponential Moving Average)
  - MACD (Moving Average Convergence Divergence)
  - Bollinger Bands
- Strategy signal generation
- Scalping strategy logic
- Trend following logic

### AiService
- OpenAI API integration
- Trading decision analysis
- Confidence scoring
- Risk level assessment
- Reasoning generation

### TradeService
- Main trading orchestrator
- Cron job execution
- Risk management
- Position sizing
- Trade history
- Statistics calculation

### WebsocketGateway
- Real-time communication
- Event broadcasting
- Client connection management

## API Endpoints

### Bybit Module
```typescript
GET    /api/bybit/balance          // Get account balance
GET    /api/bybit/positions        // Get open positions
GET    /api/bybit/orders           // Get active orders
GET    /api/bybit/history          // Get order history
GET    /api/bybit/kline/:symbol    // Get candlestick data
GET    /api/bybit/price/:symbol    // Get current price
POST   /api/bybit/order            // Place new order
POST   /api/bybit/leverage         // Set leverage
POST   /api/bybit/stop-loss        // Set stop loss
POST   /api/bybit/close-position   // Close position
DELETE /api/bybit/order/:id        // Cancel order
DELETE /api/bybit/orders           // Cancel all orders
POST   /api/bybit/subscribe        // Subscribe to WebSocket
```

### Strategy Module
```typescript
GET    /api/strategies             // List all strategies
GET    /api/strategies/:id         // Get strategy by ID
POST   /api/strategies             // Create new strategy
PUT    /api/strategies/:id         // Update strategy
DELETE /api/strategies/:id         // Delete strategy
POST   /api/strategies/:id/activate    // Activate strategy
POST   /api/strategies/:id/deactivate  // Deactivate strategy
```

### Trade Module
```typescript
GET    /api/trades                 // List all trades
GET    /api/trades/stats           // Get trading statistics
GET    /api/trades/symbol/:symbol  // Get trades by symbol
POST   /api/trades/:id/close       // Close trade
DELETE /api/trades/:id/cancel      // Cancel trade
```

## WebSocket Events

### Server → Client
```typescript
'marketUpdate'    // Market data updates
'tradeExecuted'   // Trade was executed
'balanceUpdate'   // Balance changed
```

### Client → Server
```typescript
'connect'         // Client connected
'disconnect'      // Client disconnected
```

## Security

### Environment Variables
- All sensitive data in .env files
- .env files in .gitignore
- Different configs for dev/prod

### API Key Management
- Keys stored in environment
- Never committed to git
- Separate keys for demo/production

### Rate Limiting
- Bybit API has rate limits
- OpenAI has rate limits
- Implement retry logic with exponential backoff

### Error Handling
- Try-catch blocks in all async operations
- Detailed error logging
- Graceful degradation
- Failed trades logged to database

## Deployment

### Docker Compose
```yaml
services:
  postgres:     # Database
  backend:      # NestJS API
  frontend:     # React app with Nginx
```

### Environment Setup
1. Development: Local PostgreSQL + npm run dev
2. Staging: Docker Compose on VPS
3. Production: Docker Compose with production .env

### Monitoring
- Backend logs (console.log)
- Database queries (TypeORM logging)
- WebSocket connections
- Trade execution logs

## Performance Optimization

### Backend
- Database indexing on symbol, createdAt
- Caching for frequently accessed data
- Bulk operations where possible
- Connection pooling for PostgreSQL

### Frontend
- React.memo for expensive components
- useMemo for calculations
- Lazy loading for routes
- Debouncing for API calls

### WebSocket
- Only send necessary data
- Compression enabled
- Reconnection logic

## Future Enhancements

### Short-term
- [ ] Backtesting module
- [ ] More technical indicators (Stochastic, ATR, etc.)
- [ ] Multiple timeframe analysis
- [ ] Email/Telegram notifications

### Medium-term
- [ ] Machine Learning models
- [ ] Advanced risk management
- [ ] Portfolio rebalancing
- [ ] Multi-exchange support

### Long-term
- [ ] Mobile app
- [ ] Social trading features
- [ ] Strategy marketplace
- [ ] Automated optimization

## Maintenance

### Daily
- Check logs for errors
- Monitor balance and positions
- Review trade performance

### Weekly
- Analyze strategy performance
- Adjust parameters if needed
- Update dependencies

### Monthly
- Database backup
- Security audit
- Performance review
- Cost analysis

---

Last updated: 2025-10-28
