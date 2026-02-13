# SFBBO Inventory Tracker

A full-stack inventory management system built for SFBBO (San Francisco Bay Bird Observatory) to track equipment, manage reservations, and plan for upcoming events.

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/karangattu/sfbbo-inventory-tracking.git
cd sfbbo-inventory-tracking
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

For local development, the default SQLite database is sufficient. For production with Turso:
```env
DATABASE_URL=your-turso-database-url
DATABASE_AUTH_TOKEN=your-turso-auth-token
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
├── actions/          # Server Actions for data mutations
├── app/              # Next.js App Router pages
│   ├── events/       # Events page
│   ├── inventory/    # Inventory dashboard
│   └── reservations/ # Reservations page
├── components/       # React components
├── db/               # Database schema and connection
├── public/           # Static assets
└── ...config files
```

## Database Schema

### Items
- `id`: Primary key
- `name`: Item name
- `description`: Item description
- `category`: Category for organization
- `quantity`: Total quantity available
- `storageLocation`: Where the item is stored
- `createdAt`, `updatedAt`: Timestamps

### Events
- `id`: Primary key
- `name`: Event name
- `description`: Event description
- `eventDate`: Date and time of event
- `location`: Event location
- `createdAt`: Timestamp

### Reservations
- `id`: Primary key
- `itemId`: Reference to items table
- `eventId`: Reference to events table
- `quantity`: Number of items reserved
- `status`: reserved or returned
- `conditionNotes`: Notes about item condition on return
- `reservedAt`, `returnedAt`: Timestamps

## License

ISC
