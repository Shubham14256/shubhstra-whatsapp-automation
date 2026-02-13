# Implementation Checklist

## Phase 1: Database Setup (5 minutes)

- [ ] Run database migration to add conversation state columns
- [ ] Verify columns added successfully
- [ ] Test with sample data

```sql
-- Copy from NATIVE_APPOINTMENTS_AND_LIVE_CHAT_SOLUTION.md
ALTER TABLE patients ADD COLUMN conversation_state VARCHAR(50) DEFAULT 'idle';
-- ... rest of migration
```

## Phase 2: Native Appointment Booking (30 minutes)

- [ ] Install chrono-node: `npm install chrono-node`
- [ ] Create `src/services/appointmentBookingService.js`
- [ ] Update `src/controllers/messageHandler.js`
- [ ] Test booking flow via WhatsApp
- [ ] Verify appointment appears in dashboard

**Test Command:**
```
User: "Hi"
Bot: [Shows menu]
User: Select "Book Appointment"
Bot: "When would you like to visit?"
User: "Tomorrow 3pm"
Bot: "Appointment confirmed!"
```

## Phase 3: Live Chat Backend (20 minutes)

- [ ] Create `src/routes/chatRoutes.js`
- [ ] Update `server.js` to register routes
- [ ] Update `src/controllers/webhookController.js` for AI pause check
- [ ] Test API endpoints with Postman/curl

**Test Endpoints:**
```bash
GET http://localhost:3000/api/chat/conversations?doctorId=xxx
GET http://localhost:3000/api/chat/messages/:patientId
POST http://localhost:3000/api/chat/send
POST http://localhost:3000/api/chat/pause-ai
```

## Phase 4: Live Chat Frontend (30 minutes)

- [ ] Create `shubhstra-dashboard/app/live-chat/page.tsx`
- [ ] Update `shubhstra-dashboard/components/Sidebar.tsx`
- [ ] Test UI locally
- [ ] Test real-time message sync
- [ ] Test AI pause/resume toggle

**Test Scenarios:**
1. Open Live Chat page
2. See list of conversations
3. Click on a patient
4. See message history
5. Click "Pause AI"
6. Send message from dashboard
7. Verify patient receives it
8. Patient replies
9. Verify no AI response (AI paused)
10. Click "Resume AI"
11. Patient sends message
12. Verify AI responds

## Phase 5: Integration Testing (15 minutes)

- [ ] Test complete appointment booking flow
- [ ] Test live chat with AI paused
- [ ] Test live chat with AI resumed
- [ ] Test multiple conversations simultaneously
- [ ] Test on mobile device

## Phase 6: Deployment (10 minutes)

- [ ] Commit all changes to Git
- [ ] Push to GitHub
- [ ] Verify Vercel auto-deploy (frontend)
- [ ] Verify Render deployment (backend)
- [ ] Test on production URLs

---

## Total Time Estimate: ~2 hours

## Priority Order

If you want to implement in stages:

1. **High Priority**: Native Appointment Booking (eliminates Calendly cost)
2. **Medium Priority**: Live Chat Backend (enables manual replies)
3. **Low Priority**: Live Chat UI (nice-to-have for better UX)

---

## Rollback Plan

If something breaks:

1. **Database**: Columns are nullable, won't break existing functionality
2. **Appointment Booking**: Keep Calendly link as fallback
3. **Live Chat**: AI will continue working even if chat UI has issues

---

## Support

Need help with any step? Just ask!
