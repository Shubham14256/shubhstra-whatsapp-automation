# Shubhstra Tech - Doctor Dashboard

A modern, professional dashboard for doctors to manage patients and appointments through WhatsApp automation.

## Features

### ✅ Implemented
- **Real-time Statistics**
  - Total Patients count
  - Today's Appointments count
  - Missed Calls Recovered (demo)

- **Recent Appointments Table**
  - View all appointments with patient details
  - Filter by status (Pending, Confirmed, Completed, etc.)
  - Mark appointments as done
  - Real-time updates from Supabase

- **Modern UI/UX**
  - Clean, professional design
  - Blue/White theme
  - Responsive sidebar navigation
  - Interactive components
  - Loading states

- **Supabase Integration**
  - Real-time data fetching
  - Automatic updates
  - Type-safe queries

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **State Management:** React Hooks

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Ensure Database Tables Exist

Make sure you have run the SQL scripts:
- `create_doctors_table.sql`
- `create_patients_appointments_tables.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
shubhstra-dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── lib/
│   └── supabaseClient.ts   # Supabase client & types
├── .env.local              # Environment variables
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Features Breakdown

### Dashboard Stats Cards

1. **Total Patients**
   - Fetches count from `patients` table
   - Blue theme
   - Updates in real-time

2. **Today's Appointments**
   - Filters appointments for current day
   - Green theme
   - Shows pending + confirmed

3. **Missed Calls Recovered**
   - Demo value (hardcoded as 5)
   - Purple theme
   - Will be dynamic in future

### Appointments Table

**Columns:**
- Patient Name (from patients table)
- Phone Number
- Appointment Time (formatted)
- Status (color-coded badge)
- Action (Mark Done button)

**Features:**
- Joins `appointments` with `patients` table
- Shows last 10 appointments
- Sorted by time (newest first)
- Click "Mark Done" to update status to 'completed'
- Auto-refreshes after update

### Sidebar Navigation

- **Home** - Dashboard overview
- **Patients** - Patient management (coming soon)
- **Appointments** - Appointment management (coming soon)
- **Settings** - Configuration (coming soon)

## Database Schema

### Patients Table
```sql
- id (UUID)
- phone_number (TEXT, UNIQUE)
- name (TEXT)
- doctor_id (UUID, FK)
- created_at (TIMESTAMP)
- last_seen_at (TIMESTAMP)
```

### Appointments Table
```sql
- id (UUID)
- patient_id (UUID, FK)
- doctor_id (UUID, FK)
- appointment_time (TIMESTAMP)
- status (TEXT)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Customization

### Colors

Edit `tailwind.config.js` to change the primary color:

```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Stats

To add more stat cards, edit `app/page.tsx`:

```typescript
// Add to stats interface
interface Stats {
  totalPatients: number;
  todayAppointments: number;
  missedCallsRecovered: number;
  yourNewStat: number; // Add here
}
```

## API Integration

The dashboard connects to your backend API:
- Backend: `http://localhost:3000` (Node.js server)
- Dashboard: `http://localhost:3000` (Next.js)

Make sure both are running on different ports or deploy separately.

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Environment Variables on Vercel

Add these in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Future Enhancements

- [ ] Patient management page
- [ ] Appointment scheduling interface
- [ ] Doctor authentication
- [ ] Real-time notifications
- [ ] Analytics charts
- [ ] Export reports
- [ ] Multi-doctor support
- [ ] Dark mode

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` file exists
- Verify variable names match exactly
- Restart dev server after changes

### "No appointments found"
- Ensure database tables are created
- Check Supabase connection
- Verify data exists in tables

### Styling issues
- Run `npm install` to ensure Tailwind is installed
- Check `tailwind.config.js` paths
- Clear `.next` folder and rebuild

## Support

For issues or questions:
1. Check console for errors
2. Verify Supabase connection
3. Review database schema
4. Check environment variables

## License

ISC
