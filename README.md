# Shubhstra Tech - WhatsApp Automation Platform (Phase 1)

A production-ready Node.js server for WhatsApp Cloud API integration.

## Features

### Phase 1 ✅
- ✅ Express server with configurable PORT
- ✅ WhatsApp Cloud API webhook verification (GET)
- ✅ Incoming message handling (POST)
- ✅ ES6 Modules
- ✅ Environment variable configuration
- ✅ Clean MVC architecture
- ✅ Error handling and logging
- ✅ Health check endpoints

### Phase 3 ✅
- ✅ WhatsApp message sending (text & interactive)
- ✅ Automatic menu responses to greetings
- ✅ Interactive list messages
- ✅ Message processing logic
- ✅ Error handling and logging

### Phase 4 ✅
- ✅ Interactive response handling (list/button selections)
- ✅ Appointment booking flow with links
- ✅ Location message sending
- ✅ Review booster system (smart rating handling)
- ✅ 5-star → Google Review request
- ✅ 1-4 stars → Feedback collection

### Phase 5 ✅
- ✅ Missed call API endpoint
- ✅ Revenue Guard system (missed call recovery)
- ✅ Automatic recovery message sending
- ✅ 24-hour window error handling
- ✅ Android app integration ready
- ✅ Comprehensive error logging

### Phase 6 ✅
- ✅ Patient CRM database (patients table)
- ✅ Appointments management (appointments table)
- ✅ Automatic patient tracking on every message
- ✅ Template message support (bypass 24-hour window)
- ✅ Smart fallback (interactive → template)
- ✅ Patient service with full CRUD operations

### Phase 8 ✅
- ✅ Clinic timings check (opening/closing hours)
- ✅ Holiday management (JSONB array)
- ✅ Patient search by name (doctor command: /search)
- ✅ Queue management system (token numbers)
- ✅ Wait time calculation (smart estimation)
- ✅ Multi-language support (English & Marathi)
- ✅ Doctor admin commands (/search, /queue)
- ✅ Supabase database integration
- ✅ Doctor identification by phone number
- ✅ Doctor service with database queries
- ✅ Automatic doctor lookup on incoming messages

## Project Structure

```
shubhstra-tech/
├── src/
│   ├── config/
│   │   └── supabaseClient.js       # Supabase client
│   ├── controllers/
│   │   └── webhookController.js    # Webhook logic
│   ├── routes/
│   │   └── webhookRoutes.js        # Route definitions
│   ├── services/
│   │   └── doctorService.js        # Doctor database operations
│   └── app.js                      # Express app setup
├── database/
│   └── create_doctors_table.sql    # Database schema
├── server.js                       # Server entry point
├── .env                           # Environment variables (not in git)
├── .env.example                   # Environment template
├── .gitignore
├── package.json
├── README.md
└── PHASE2_SETUP.md                # Phase 2 setup guide
```

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Update `.env` with your values:
```env
PORT=3000
WEBHOOK_VERIFY_TOKEN=your_secure_verify_token_here
NODE_ENV=development

# Supabase (Phase 2)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

3. Set up the database (Phase 2):
   - Go to Supabase SQL Editor
   - Run the SQL script from `database/create_doctors_table.sql`
   - Add your doctor records with WhatsApp Business phone numbers

## Running the Server

```bash
# Production mode
npm start

# Development mode (with auto-reload on Node 18+)
npm run dev
```

## API Endpoints

### Health Check
```
GET /
GET /health
```

### Webhook Verification (Meta)
```
GET /webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE_STRING
```

### Receive Messages (Meta)
```
POST /webhook
Content-Type: application/json
```

### Missed Call Recovery (Android App)
```
POST /api/missed-call
Content-Type: application/json

Body:
{
  "doctor_phone_number": "919876543210",
  "patient_phone_number": "919999999999"
}
```

## Testing Webhook Verification

You can test the webhook verification locally:

```bash
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=your_secure_verify_token_here&hub.challenge=test123"
```

Expected response: `test123`

## Setting Up with Meta WhatsApp Cloud API

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or select existing app
3. Add WhatsApp product
4. Configure webhook:
   - Callback URL: `https://your-domain.com/webhook`
   - Verify Token: Use the same token from your `.env` file
   - Subscribe to `messages` webhook field

## Phase 4 Setup

See `PHASE4_SETUP.md` for detailed Phase 4 setup instructions including:
- Interactive response handling
- Appointment booking configuration
- Location message setup
- Review booster system
- Google Review link configuration

## Phase 5 Setup

See `PHASE5_SETUP.md` for detailed Phase 5 setup instructions including:
- Missed call API endpoint
- Revenue Guard system
- Android app integration
- 24-hour window handling
- API testing and security

## Phase 6 Setup

See `PHASE6_SETUP.md` for detailed Phase 6 setup instructions including:
- Patient CRM database setup
- Appointments management
- Template message configuration
- Meta Business Manager setup
- Analytics queries

## Next Steps (Future Phases)

- [x] Database integration (Supabase) ✅
- [x] Doctor identification ✅
- [x] Message sending functionality ✅
- [x] Automated menu responses ✅
- [x] Handle interactive responses (menu selections) ✅
- [x] Review booster system ✅
- [x] Missed call recovery (Revenue Guard) ✅
- [x] Template Messages for 24+ hour window ✅
- [x] Patient identification and storage ✅
- [ ] Automated appointment reminders
- [ ] Conversation history tracking
- [ ] Analytics dashboard API
- [ ] Bulk messaging system
- [ ] Payment tracking integration

## License

ISC
