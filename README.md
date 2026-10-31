# High-Performance Auction Widget

A lightweight, production-ready live auction widget designed for high-concurrency real-time bidding interfaces. Built with a strict focus on web performance, zero main-thread blockages, tight bundle size constraints, and reliable state synchronization over WebSocket connections.

## 🚀 Key Highlights & Performance Metrics

* **Ultra-Lightweight Bundle:** Reduced JS payload from **~102 KB gzip** (standard React DOM) down to **~21.9 KB gzip** (~62 KB uncompressed) using `@preact/compat`.
* **Zero Heavy Date Dependencies:** Replaced monolithic date libraries (`luxon`) with native `Intl` and custom date arithmetic for zero-bundle-cost countdown calculations.
* **Resilient Real-time Sync:** Powered by `PartySocket` with automatic backoff reconnection and immediate state re-hydration upon network restore.
* **Strict Architecture:** Clean Feature-Sliced Design (FSD) architecture ensuring high modularity, layer isolation, and testability.
* **Code Quality & Standards:** Zero warnings/errors enforced by ESLint v9 (Flat Config) with strict TypeScript rules and automated Prettier code formatting.
* **Targeted Test Coverage:** Comprehensive Vitest + `@testing-library/preact` suite covering critical UI states, store interactions, optimistic rollback logic, and time formatting edge cases.

## 🏗️ Architecture (Feature-Sliced Design)

The project follows the **Feature-Sliced Design (FSD)** methodology to maintain strict boundaries and clean layer isolation:

```
src/
├── app/                  # Application initialization, root wrappers, styles
├── widgets/              # Composite UI blocks (e.g., AuctionCard)
│   └── auction-card/     # State machine coordinator (Active, Completed, Loading, etc.)
├── features/             # User interaction scenarios
│   └── place-bid/        # Bid submission logic, user validation, rollback state
├── entities/             # Business domain models
│   └── auction/          # Zustand store, timer calculations, domain facts UI
└── shared/               # Reusable UI primitives, API layer, formatters, setup
    ├── api/              # PartySocket real-time client & mock server
    ├── lib/              # Formatters, custom toast system
    └── ui/               # Atomic components (Input, Button)
```

## ⚡ Performance Optimization Strategy

### 1. Preact Runtime Migration
By aliasing `react` and `react-dom` to `preact/compat` via `@preact/preset-vite`, the core runtime overhead was reduced by **~85%** while retaining standard React developer experience (DX) and seamless compatibility with Zustand hooks.

### 2. Native Date & Currency Formatting
* **Currency:** Formatted using native `Intl.NumberFormat('en-US')`.
* **Countdown Timer:** Native date delta calculation (`src/shared/lib/formatters.ts`) to parse remaining time (`1d 3h`, `02m 05s`) without pulling in external time/timezone libraries.

### 3. Event Throttling & UI Protection
* High-frequency UI triggers and socket state sync operations are controlled via `lodash.throttle` to prevent unneeded re-renders and guard against UI thrashing during rapid user input or high-frequency auction updates.

## 🛠️ Tech Stack

* **Framework / Library:** Preact (`@preact/compat`)
* **State Management:** Zustand
* **Build Tool:** Vite 6 + Tailwind CSS v4
* **Real-Time Layer:** PartySocket / WebSockets
* **Throttling:** `lodash.throttle`
* **Code Quality:** ESLint v9 (Flat Config) + Prettier + TypeScript
* **Testing:** Vitest + `@testing-library/preact` + JSDOM
* **UI Feedback:** Toastify-JS

## 🧪 Testing & Code Quality

### Code Standards & Linting

```bash
# Run ESLint check across TS/TSX files
npm run lint

# Automatically fix linting issues
npm run lint:fix

# Format code using Prettier
npm run format
```

### Key Tested Scenarios

* **State Machine Transitions (`AuctionCard`):** Verifies rendering of `LoadingState`, `ActiveState`, `CompletedState`, `NonMemberState`, and `UnavailableState`.
* **Bid Form Submission & Optimistic Rollback (`PlaceBidForm`):** Ensures inputs gracefully roll back to the last confirmed bid amount when a server rejection (`lastRejectedAt`) is received.
* **State Management (`useAuctionStore`):** Tests state hydration, WebSocket socket event handling, and status mutations.
* **Formatting Utilities (`formatters`):** Tests output accuracy across zero padding, past-date handling, and dynamic time unit scale switches.

### Running Tests

```bash
# Run unit & integration tests
npm run test
```

## 📦 Production Build & Asset Distribution

To generate production build artifacts:

```bash
npm run build
```

The output build in `dist/` uses fixed entry names for straightforward S3/CDN deployment:

* **`dist/auction-client.js`** (~21.9 KB gzipped)
* **`dist/auction-client.css`** (~4.9 KB gzipped)

### Bundle Analysis

To inspect the module breakdown of the production bundle:

```bash
npm run build
```

*(Generates `bundle-analysis.html` in the root folder).*