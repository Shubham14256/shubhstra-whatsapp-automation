# 🚀 Quick Reference - Add Doctor

## 📱 Access URL

**Local:**
```
http://localhost:3001/admin/add-doctor
```

**Production:**
```
https://shubhstra-dashboard.vercel.app/admin/add-doctor
```

---

## ⚡ Quick Setup (One-Time)

1. Get Service Role Key from Supabase:
   - https://supabase.com/dashboard/project/vliswvuyapadipuxhfuf/settings/api
   - Copy `service_role` key

2. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Add to Vercel:
   - Settings → Environment Variables
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (paste key)

4. Restart server:
   ```bash
   npm run dev
   ```

---

## 📝 Required Fields

| Field | Example | Notes |
|-------|---------|-------|
| Email | doctor@example.com | For login |
| Password | Doctor@123 | Min 6 chars |
| Name | Dr. John Doe | Full name |
| Phone | 919876543210 | No spaces/+ |

---

## 🎯 Quick Test

```
Email: test@example.com
Password: Test123
Name: Dr. Test
Phone: 919876543210
```

Click "Create Doctor Account" → Should see success message

---

## 🔧 Troubleshooting

| Error | Fix |
|-------|-----|
| "Failed to create auth user" | Check service role key |
| "User already registered" | Email already exists |
| "Failed to create doctor record" | Phone number duplicate |
| Page not loading | Restart dev server |

---

## 📱 Mobile Tips

- Bookmark the page for quick access
- Add to home screen (Safari/Chrome)
- Works offline after first load
- All fields are touch-friendly

---

## ✅ After Creating Doctor

Doctor can login at:
```
https://shubhstra-dashboard.vercel.app/login
```

Using the email and password you set.

---

**That's it! Simple and mobile-friendly! 🎉**

