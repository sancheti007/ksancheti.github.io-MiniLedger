# 🏪 Shop Ledger — दुकान खाता बही

A full-stack **Mini Shop Ledger Management System** built with Angular 17 and .NET 6.0 REST API (Monolith Architecture).

> **Live Demo**: Works on GitHub Pages with mock data — no backend required!

---

## 📋 Features

| Feature | Description |
|---|---|
| 👥 **Customer Register** | Full CRUD with Customer ID, Name, Mobile, Interest Rate |
| 💰 **Transaction Ledger** | Debit/Credit/Interest tracking with running balance |
| 🌾 **Raw Materials** | Wheat, Joa, Jawar, Seeds — debit & credit per customer |
| 📊 **Dashboard** | Monthly/Half-yearly/Yearly summary with print support |
| 🌐 **Bilingual** | English & Hindi (हिंदी) language toggle |
| 🖨️ **Print Statement** | CSS print-optimized account statements |
| 📱 **Responsive** | Mobile-friendly design |

---

## 🏗️ Architecture

```
shop-ledger/
├── backend/                    # .NET 6.0 REST API (Monolith)
│   ├── Controllers/            # API Controllers (Customers, Transactions, RawMaterials, Dashboard)
│   ├── Services/               # Business Logic Layer
│   ├── Data/                   # AppDbContext (SQLite via EF Core)
│   ├── Models/                 # Domain Models
│   ├── DTOs/                   # Data Transfer Objects
│   └── ShopLedger.csproj
│
├── frontend/                   # Angular 17 Standalone App
│   └── src/app/
│       ├── components/
│       │   ├── dashboard/      # KPI cards, charts, summaries
│       │   ├── customers/      # Customer register CRUD
│       │   ├── transactions/   # Transaction ledger
│       │   ├── raw-materials/  # Raw material management
│       │   └── navbar/         # Navigation + language toggle
│       ├── services/
│       │   ├── api.service.ts  # Real API calls with mock fallback
│       │   ├── mock-api.service.ts  # In-memory data for demo
│       │   └── language.service.ts # EN/HI translation
│       └── models/             # TypeScript interfaces + translations
│
└── .github/workflows/
    └── deploy.yml              # GitHub Actions → GitHub Pages
```

---

## 🚀 Quick Start

### Option 1: GitHub Pages (Frontend Only — No Backend Needed)

The app uses **smart mock data fallback**: when the backend is unreachable, it automatically serves sample data so you can demo the UI.

#### Deploy to GitHub Pages:
1. Fork/clone this repository
2. Go to **Settings → Pages → Source**: GitHub Actions
3. Push to `main` branch
4. GitHub Actions builds and deploys automatically
5. Your app is live at: `https://<your-username>.github.io/<repo-name>/`

---

### Option 2: Full Stack (Local Development)

#### Backend (.NET 6.0)

**Prerequisites**: [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)

```bash
cd backend
dotnet restore
dotnet run
# API available at: http://localhost:5000
# Swagger UI at: http://localhost:5000/swagger
```

The SQLite database (`shopledger.db`) is created automatically with seed data.

#### Frontend (Angular 17)

**Prerequisites**: Node.js 18+, Angular CLI 17

```bash
cd frontend
npm install
ng serve
# App available at: http://localhost:4200
```

---

## 🗄️ Database Schema

```
Customers
├── CustomerId (PK, auto-increment)
├── CustomerName (required)
├── MobileNumber
├── InterestRate (default: 2%)
├── CreatedDate
└── IsActive

Transactions
├── TransactionId (PK)
├── CustomerId (FK → Customers)
├── DebitAmount
├── CreditAmount
├── InterestAmount (auto-calculated)
├── ItemDescription
├── TransactionDate
└── TransactionType (GENERAL | RAW_MATERIAL)

RawMaterials
├── RawMaterialId (PK)
├── CustomerId (FK → Customers)
├── MaterialType (wheat | joa | jawar | seeds)
├── DebitQuantity / CreditQuantity
├── UnitPrice
├── DebitAmount / CreditAmount (auto-calculated)
├── Unit (KG | QUINTAL | TON | BAG)
├── Remarks
└── EntryDate
```

---

## 🌐 API Reference

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | Get all active customers |
| GET | `/api/customers/{id}` | Get customer by ID |
| GET | `/api/customers/{id}/transactions` | Get customer's ledger |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Soft delete |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions?from=&to=` | Get transactions (with date filter) |
| POST | `/api/transactions` | Create transaction (auto-calculates interest) |
| DELETE | `/api/transactions/{id}` | Delete transaction |

### Raw Materials
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rawmaterials?customerId=` | Get raw materials |
| POST | `/api/rawmaterials` | Create entry (auto-calculates amounts) |
| DELETE | `/api/rawmaterials/{id}` | Delete entry |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/monthly` | Monthly summary |
| GET | `/api/dashboard/halfyearly` | 6-month summary |
| GET | `/api/dashboard/yearly` | Yearly summary |

---

## 🌐 Deploy Backend to Cloud

For full production use, deploy the backend to:

### Railway (Recommended — Free tier)
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

### Render
1. Create new Web Service
2. Connect your GitHub repo
3. Set Build Command: `dotnet publish -c Release -o output`
4. Set Start Command: `dotnet output/ShopLedger.dll`

### Azure App Service
```bash
az webapp create --resource-group myRG --plan myPlan --name my-shop-ledger --runtime "DOTNET|6.0"
az webapp deploy --resource-group myRG --name my-shop-ledger --src-path ./backend
```

After deploying, update `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-deployed-backend.railway.app/api'
};
```

---

## 🖨️ Print Statement

- Open **Dashboard** or **Transactions** page
- Click **🖨️ Print Statement**
- Browser print dialog opens with print-optimized CSS
- Navigation, buttons, and filters are hidden in print mode

---

## 🌍 Language Support

Toggle between **English** and **हिंदी** using the language button in the navbar.

Supported translations include all UI labels, form fields, messages, and material type names. The `LanguageService` uses Angular Signals for reactive language switching.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17 (Standalone Components, Signals) |
| Backend | .NET 6.0 Web API (Monolith) |
| Database | SQLite (via Entity Framework Core 6) |
| ORM | Entity Framework Core 6 |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages (frontend) + Railway/Render (backend) |
| Fonts | Noto Sans Devanagari (Hindi support) + Sora |

---

## 📝 License
MIT — Free for personal and commercial use.
