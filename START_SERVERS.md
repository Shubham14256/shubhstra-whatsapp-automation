# 🚀 How to Start Servers from Terminal

## Quick Start Commands

---

## Option 1: Start Both Servers (Recommended)

### Open 2 Terminal Windows:

**Terminal 1 - Backend Server:**
```bash
cd "C:\Users\Shree\OneDrive\Desktop\shubhstra-backend Doctor"
node server.js
```

**Terminal 2 - Dashboard Server:**
```bash
cd "C:\Users\Shree\OneDrive\Desktop\shubhstra-backend Doctor\shubhstra-dashboard"
npm run dev
```

---

## Option 2: Using Full Node Path

### Terminal 1 - Backend:
```bash
cd "C:\Users\Shree\OneDrive\Desktop\shubhstra-backend Doctor"
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

### Terminal 2 - Dashboard:
```bash
cd "C:\Users\Shree\OneDrive\Desktop\shubhstra-backend Doctor\shubhstra-dashboard"
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe node_modules\next\dist\bin\next dev -p 3001
```

---

## Option 3: Using npm Scripts

### Terminal 1 - Backend:
```bash
cd "C:\Users\Shree\OneDrive\Desktop\shubhstra-backend Doctor"
npm start
```

### Terminal 2 - Dashboard:
```bash
cd "C:\Users\Shree\OneDrive\Desktop\shubhstra-backend Doctor\shubhstra-dashboard"
npm run dev
```

---

## Verify Servers are Running

### Check Backend:
Open browser: http://localhost:3000/health

Should see:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2026-02-09T..."
}
```

### Check Dashboard:
Open browser: http://localhost:3001

Should see: Login page or Dashboard (if logged in)

---

## Stop Servers

### In Terminal:
Press `Ctrl + C` in each terminal window

---

## Troubleshooting

### Port Already in Use:

**Find and Kill Process on Port 3000:**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or using netstat
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Find and Kill Process on Port 3001:**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# Or using netstat
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### Node Not Found:

**Check Node Installation:**
```bash
node --version
```

**If not found, use full path:**
```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe --version
```

### npm Not Found:

**Use full npm path:**
```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\npm.cmd install
```

---

## Server URLs

### Backend API:
- **URL:** http://localhost:3000
- **Webhook:** http://localhost:3000/webhook
- **Health:** http://localhost:3000/health

### Dashboard:
- **URL:** http://localhost:3001
- **Login:** http://localhost:3001/login
- **Payment:** http://localhost:3001/payment

---

## Expected Output

### Backend Server:
```
✅ Supabase client initialized
🚀 Shubhstra Tech WhatsApp Automation Platform
═══════════════════════════════════════════════
✅ Server running in development mode
✅ Listening on port 3000
✅ Webhook URL: http://localhost:3000/webhook
✅ Health check: http://localhost:3000/health
═══════════════════════════════════════════════
🤖 Initializing Cron Jobs...
✅ Appointment Reminder Job scheduled (every 30 minutes)
✅ Payment Recovery Job scheduled (daily at 8 PM)
✅ Patient Recall Job scheduled (daily at 11 AM)
✅ Weekly Health Tips Job scheduled (every Monday at 9 AM)
✅ Cron Jobs initialized successfully
```

### Dashboard Server:
```
▲ Next.js 15.5.12
- Local:        http://localhost:3001
- Network:      http://192.168.132.20:3001
- Environments: .env.local

✓ Starting...
✓ Ready in 6.8s
```

---

## Quick Commands Reference

### Navigate to Backend:
```bash
cd "C:\Users\Shree\OneDrive\Desktop\shubhstra-backend Doctor"
```

### Navigate to Dashboard:
```bash
cd "C:\Users\Shree\OneDrive\Desktop\shubhstra-backend Doctor\shubhstra-dashboard"
```

### Start Backend:
```bash
node server.js
```

### Start Dashboard:
```bash
npm run dev
```

### Check Running Processes:
```bash
# PowerShell
Get-Process node

# CMD
tasklist | findstr node
```

---

## Development Tips

### Keep Terminals Open:
- Don't close terminal windows while servers are running
- Servers will stop if you close the terminal

### Watch for Errors:
- Check terminal output for errors
- Red text usually indicates errors
- Green checkmarks indicate success

### Restart Servers:
- Press `Ctrl + C` to stop
- Run start command again
- Useful after code changes

---

## Production Deployment (Future)

### Backend:
- Deploy to Railway, Render, or AWS
- Set environment variables
- Use PM2 for process management

### Dashboard:
- Deploy to Vercel (recommended for Next.js)
- Set environment variables
- Automatic deployments from Git

---

## Need Help?

### Check Logs:
- Look at terminal output
- Check for error messages
- Note any red text or warnings

### Common Issues:
1. Port already in use → Kill existing process
2. Node not found → Use full path
3. Module not found → Run `npm install`
4. Environment variables missing → Check `.env` files

---

**Both servers should now be running! 🚀**

**Backend:** http://localhost:3000 ✅  
**Dashboard:** http://localhost:3001 ✅
