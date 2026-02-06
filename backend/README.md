# Smart Transit Kiosk Backend

A backend API for a smart transit kiosk system that manages train ticket generation, validation, and purchase processing.

## 🚀 Technologies

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Database
- **Jest** - Testing framework
- **Docker & Docker Compose** - Containerization

## 🏗️ Architecture

The project follows a modular architecture with clear separation of concerns:

```
src/
├── config/          # Configuration files (API, DB, Environment)
├── controllers/     # Business logic layer
├── routes/         # API route definitions
├── generated/      # Prisma generated client
└── server.ts       # Application entry point

prisma/
└── schema.prisma   # Database schema definition

tests/              # Unit and integration tests
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-transit-kiosk/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

   Configure the following variables in `.env`:
   ```env
   PORT=3333
   DATABASE_URL="postgresql://user:password@localhost:5432/smart_transit"
   POSTGRES_USER=your_db_user
   POSTGRES_PASSWORD=your_db_password
   POSTGRES_DB=smart_transit
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run generate

   # Run database migrations
   npm run migrate
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Using Docker (Recommended)
```bash
# Build and run with Docker Compose
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f app

# Stop containers
docker compose down
```

The API will be available at `http://localhost:3333`

## 🧪 Testing

Run the complete test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Check API health status

### Tickets
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets/:id` - Get ticket by ID

### Purchases
- `POST /api/purchases` - Create a purchase with ticket
- `GET /api/purchases/:id` - Get purchase by ID

## 💾 Data Models

### Ticket
```typescript
{
  id: string;
  type: TicketType; // SINGLE | DAY_PASS
  status: TicketStatus; // ACTIVE | USED | EXPIRED
  validUntil: Date;
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Purchase
```typescript
{
  id: string;
  ticketId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  paymentMethod: PaymentMethod; // CREDIT_CARD | DEBIT_CARD | CASH
  amount: number;
  createdAt: Date;
}
```

## 📜 Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run migrate` - Run database migrations
- `npm run generate` - Generate Prisma client
- `npm test` - Run test suite

## 🔧 Development Workflow

1. Make changes to the code
2. Run tests: `npm test`
3. Build the project: `npm run build`
4. Test with Docker: `docker compose up --build`

## 🐳 Docker Configuration

The application includes:
- **Multi-stage Dockerfile** for optimized production builds
- **Docker Compose** setup with PostgreSQL database
- **Volume persistence** for database data
- **Environment-based configuration**

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3333 |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `POSTGRES_USER` | Database username | Required |
| `POSTGRES_PASSWORD` | Database password | Required |
| `POSTGRES_DB` | Database name | Required |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.