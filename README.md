# 🤖 AI-Powered Bybit Trading Bot

Автоматический торговый бот для Bybit с использованием технических индикаторов и AI-анализа через OpenAI GPT-4.

## 📋 Содержание

- [Возможности](#возможности)
- [Технологический стек](#технологический-стек)
- [Архитектура](#архитектура)
- [Установка и запуск](#установка-и-запуск)
- [Конфигурация](#конфигурация)
- [Использование](#использование)
- [API Endpoints](#api-endpoints)
- [Безопасность](#безопасность)

## 🎯 Возможности

### Торговля
- ✅ Автоматическая торговля фьючерсами на Bybit (long/short)
- ✅ Поддержка demo и live аккаунтов
- ✅ Множественные стратегии (скальпинг, трендовая, среднесрочная)
- ✅ AI-подтверждение сделок через OpenAI GPT-4
- ✅ Технические индикаторы: RSI, EMA, MACD, Bollinger Bands
- ✅ Автоматический стоп-лосс и тейк-профит
- ✅ Управление рисками и размером позиции

### Мониторинг
- ✅ Real-time обновления через WebSocket
- ✅ Dashboard с балансом, позициями и P&L
- ✅ История сделок с визуализацией
- ✅ Графики цен и индикаторов
- ✅ Статистика торговли и win rate

### Управление
- ✅ Создание и настройка стратегий через UI
- ✅ Активация/деактивация стратегий
- ✅ Настройка параметров риска
- ✅ Ручное закрытие позиций

## 🛠 Технологический стек

### Backend
- **NestJS** - фреймворк для Node.js
- **TypeScript** - типизация
- **TypeORM** - ORM для PostgreSQL
- **PostgreSQL** - база данных
- **Bybit API (bybit-api)** - официальный SDK
- **OpenAI API** - AI-анализ
- **Socket.io** - WebSocket для real-time
- **technicalindicators** - расчет индикаторов

### Frontend
- **React 19** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик
- **TailwindCSS** - стилизация
- **Chart.js** - графики
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **Socket.io-client** - WebSocket клиент

### DevOps
- **Docker** - контейнеризация
- **Docker Compose** - оркестрация
- **Nginx** - reverse proxy для frontend

## 🏗 Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Strategies  │  │   Charts     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                         ↕ WebSocket ↕ REST API              │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  API Gateway                          │  │
│  └──────────────────────────────────────────────────────┘  │
│         ↓              ↓              ↓              ↓      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Bybit   │  │ Strategy │  │   AI     │  │  Trade   │  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│       ↓              ↓              ↓              ↓        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │    Strategies │ Trades │ Settings │ Logs             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           ↓                              ↓
    ┌──────────┐                    ┌──────────┐
    │  Bybit   │                    │  OpenAI  │
    │   API    │                    │   API    │
    └──────────┘                    └──────────┘
```

### Процесс торговли

1. **Сбор данных**: BybitService получает исторические данные (klines)
2. **Анализ индикаторов**: StrategyService рассчитывает RSI, EMA, MACD, Bollinger
3. **Сигнал стратегии**: Определяется LONG/SHORT/HOLD на основе индикаторов
4. **AI-подтверждение**: OpenAI анализирует данные и возвращает решение
5. **Проверка рисков**: Проверяется confidence, лимиты позиций, баланс
6. **Исполнение**: TradeService размещает ордер на Bybit
7. **Мониторинг**: WebSocket отправляет обновления в UI

## 🚀 Установка и запуск

### Требования
- Node.js 20+
- PostgreSQL 16+ (или Docker)
- Bybit API ключи (demo или production)
- OpenAI API ключ

### Вариант 1: Docker (Рекомендуется)

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd trading-bot
```

2. Создайте .env файл в backend:
```bash
cd backend
cp .env.example .env
# Отредактируйте .env и добавьте свои API ключи
```

3. Создайте .env файл в frontend:
```bash
cd ../frontend
cp .env.example .env
```

4. Запустите через Docker Compose:
```bash
cd ../docker
docker-compose up -d
```

5. Откройте браузер:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Вариант 2: Локальная разработка

#### Backend

1. Установите зависимости:
```bash
cd backend
npm install
```

2. Настройте PostgreSQL:
```bash
# Создайте базу данных
createdb trading_bot
```

3. Создайте .env файл:
```bash
cp .env.example .env
# Заполните переменные окружения
```

4. Запустите сервер:
```bash
npm run start:dev
```

#### Frontend

1. Установите зависимости:
```bash
cd frontend
npm install
```

2. Создайте .env файл:
```bash
cp .env.example .env
```

3. Запустите dev сервер:
```bash
npm run dev
```

## ⚙️ Конфигурация

### Backend Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=trading_bot

# Bybit API
BYBIT_API_KEY=your_api_key
BYBIT_API_SECRET=your_api_secret
BYBIT_USE_DEMO=true  # true для demo аккаунта

# OpenAI
OPENAI_API_KEY=your_openai_key

# Risk Management (опционально)
DEFAULT_RISK_PERCENTAGE=1.0
DEFAULT_STOP_LOSS_PERCENTAGE=2.0
DEFAULT_TAKE_PROFIT_PERCENTAGE=5.0
MAX_POSITIONS=3
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

### Получение API ключей

#### Bybit API Keys (Demo)
1. Зарегистрируйтесь на https://testnet.bybit.com
2. Перейдите в API Management
3. Создайте новый API ключ с правами:
   - Read-Write
   - Contract Trading
   - Wallet

#### OpenAI API Key
1. Зарегистрируйтесь на https://platform.openai.com
2. Перейдите в API Keys
3. Создайте новый ключ
4. Пополните баланс ($5-10 достаточно для начала)

## 📖 Использование

### 1. Создание стратегии

1. Откройте http://localhost:5173/strategies
2. Нажмите "Create New Strategy"
3. Заполните форму:
   - **Name**: Название стратегии (например, "BTC Scalping")
   - **Type**: Тип стратегии (scalping/trend/medium-term)
   - **Symbols**: Торговые пары (например, BTCUSDT)
   - **Timeframe**: Таймфрейм (1m, 5m, 15m, 1h, 4h)
   - **Risk %**: Процент капитала на сделку (0.5-2%)
   - **Max Positions**: Максимум открытых позиций (1-5)
   - **Stop Loss %**: Процент стоп-лосса (1-5%)
   - **Take Profit %**: Процент тейк-профита (2-10%)
   - **Use AI**: Включить AI подтверждение
   - **Min AI Confidence**: Минимальная уверенность AI (50-90%)

4. Нажмите "Create Strategy"

### 2. Активация стратегии

1. В списке стратегий нажмите "Activate"
2. Стратегия начнет работать автоматически
3. Проверка рынка происходит каждую минуту
4. Сделки отображаются в Dashboard

### 3. Мониторинг

Dashboard показывает:
- **Account Balance**: Доступный баланс и equity
- **Total Trades**: Количество сделок
- **Win Rate**: Процент прибыльных сделок
- **Total P&L**: Общая прибыль/убыток
- **Price Chart**: График цены в реальном времени
- **Open Positions**: Текущие открытые позиции
- **Recent Trades**: История последних сделок

### 4. Ручное управление

- **Закрыть позицию**: Кнопка "Close" в Open Positions
- **Закрыть сделку**: Кнопка "Close" в Recent Trades
- **Деактивировать стратегию**: Кнопка "Deactivate" в Strategies

## 🔌 API Endpoints

### Bybit

```
GET    /api/bybit/balance          - Получить баланс
GET    /api/bybit/positions        - Получить позиции
GET    /api/bybit/orders           - Получить открытые ордера
GET    /api/bybit/history          - История ордеров
GET    /api/bybit/kline/:symbol    - Получить kline данные
GET    /api/bybit/price/:symbol    - Текущая цена
POST   /api/bybit/order            - Разместить ордер
POST   /api/bybit/leverage         - Установить плечо
POST   /api/bybit/stop-loss        - Установить стоп-лосс
POST   /api/bybit/close-position   - Закрыть позицию
DELETE /api/bybit/order/:symbol/:id - Отменить ордер
DELETE /api/bybit/orders           - Отменить все ордера
```

### Strategies

```
GET    /api/strategies       - Получить все стратегии
GET    /api/strategies/:id   - Получить стратегию
POST   /api/strategies       - Создать стратегию
PUT    /api/strategies/:id   - Обновить стратегию
DELETE /api/strategies/:id   - Удалить стратегию
POST   /api/strategies/:id/activate   - Активировать
POST   /api/strategies/:id/deactivate - Деактивировать
```

### Trades

```
GET    /api/trades              - Получить все сделки
GET    /api/trades/stats        - Статистика
GET    /api/trades/symbol/:sym  - Сделки по символу
POST   /api/trades/:id/close    - Закрыть сделку
DELETE /api/trades/:id/cancel   - Отменить сделку
```

## 🔒 Безопасность

### Важно!

1. **Никогда не коммитьте .env файлы**
   - Добавлены в .gitignore
   - Используйте .env.example как шаблон

2. **Храните API ключи в безопасности**
   - Используйте environment variables
   - Не делитесь ключами
   - Регулярно ротируйте ключи

3. **Начинайте с demo аккаунта**
   - Протестируйте на testnet.bybit.com
   - Установите `BYBIT_USE_DEMO=true`
   - Переходите на production только после тестирования

4. **Управление рисками**
   - Начинайте с малого процента риска (0.5-1%)
   - Ограничивайте максимум открытых позиций
   - Всегда используйте стоп-лоссы

5. **Мониторинг**
   - Регулярно проверяйте логи
   - Следите за балансом
   - Настройте алерты для критических событий

## 📊 Индикаторы и стратегии

### RSI (Relative Strength Index)
- **Период**: 14
- **Перекупленность**: > 70
- **Перепроданность**: < 30
- Используется для определения разворотов

### EMA (Exponential Moving Average)
- **Короткая**: 9 периодов
- **Длинная**: 21 период
- Пересечение указывает на смену тренда

### MACD (Moving Average Convergence Divergence)
- **Быстрая**: 12
- **Медленная**: 26
- **Сигнал**: 9
- Гистограмма показывает силу тренда

### Bollinger Bands
- **Период**: 20
- **Стандартное отклонение**: 2
- Границы для определения волатильности

### Типы стратегий

#### Скальпинг
- Короткие таймфреймы (1-5 минут)
- Быстрые входы/выходы
- Требует RSI < 30 для LONG, > 70 для SHORT
- Подтверждение EMA и MACD

#### Трендовая
- Средние таймфреймы (15-60 минут)
- Следование за трендом
- EMA пересечение + MACD подтверждение
- Bollinger Bands для входов

#### Среднесрочная
- Длинные таймфреймы (1-4 часа)
- Позиции удерживаются дольше
- Больший take profit
- Меньше сделок, выше качество

## 🤖 AI Integration

### Как работает AI

1. **Сбор контекста**: 
   - Текущая цена
   - Все индикаторы (RSI, EMA, MACD, BB)
   - Последние 10 цен
   - Сигнал стратегии

2. **Анализ GPT-4**:
   - Модель: gpt-4o
   - Temperature: 0.2 (более детерминированный)
   - Response format: JSON

3. **Ответ AI**:
   ```json
   {
     "action": "LONG|SHORT|HOLD",
     "confidence": 0-100,
     "reasoning": "Объяснение решения",
     "riskLevel": "LOW|MEDIUM|HIGH"
   }
   ```

4. **Проверка**:
   - Confidence должен быть выше minAiConfidence
   - Risk level учитывается в размере позиции

### Преимущества AI

- ✅ Учитывает множество факторов одновременно
- ✅ Адаптируется к рыночным условиям
- ✅ Предоставляет объяснение решений
- ✅ Снижает ложные сигналы
- ✅ Повышает общую прибыльность

## 🐛 Troubleshooting

### Backend не запускается

1. Проверьте PostgreSQL:
```bash
psql -U postgres -c "SELECT 1"
```

2. Проверьте .env файл:
```bash
cat backend/.env
```

3. Проверьте логи:
```bash
cd backend
npm run start:dev
```

### Frontend не подключается к API

1. Проверьте VITE_API_URL в .env
2. Проверьте CORS в backend (main.ts)
3. Откройте Network tab в DevTools

### Нет сделок

1. Проверьте активность стратегии
2. Проверьте логи backend
3. Проверьте баланс аккаунта
4. Проверьте API ключи Bybit
5. Убедитесь что рынок активен

### AI не работает

1. Проверьте OPENAI_API_KEY
2. Проверьте баланс OpenAI
3. Проверьте логи ошибок
4. Попробуйте отключить AI (useAiConfirmation: false)

## 📝 Лицензия

MIT License - свободное использование

## 🤝 Поддержка

Для вопросов и предложений:
- GitHub Issues
- Email: support@example.com

## ⚠️ Disclaimer

Этот бот предназначен для образовательных целей. Торговля криптовалютами связана с высоким риском. Используйте на свой страх и риск. Авторы не несут ответственности за финансовые потери.

**Всегда тестируйте на demo аккаунте перед использованием реальных средств!**

---

Made with ❤️ and TypeScript
