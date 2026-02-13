# 🚀 Quick Deploy Reference Card

## ✅ DONE
- [x] Code pushed to GitHub
- [x] Commit: `16163bb`
- [x] Auto-deploy triggered

---

## ⚠️ DO THIS NOW (2 minutes)

### Run Database Migration

1. Open: https://vliswvuyapadipuxhfuf.supabase.co
2. Click: **SQL Editor**
3. Paste and run:

```sql
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS is_bot_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bot_paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bot_paused_by UUID REFERENCES doctors(id);

CREATE INDEX IF NOT EXISTS idx_patients_is_bot_paused ON patients(is_bot_paused);
```

4. Should see 3 rows returned ✅

---

## ⏳ WAIT (5-8 minutes)

Auto-deploy is running on Render.

Check: https://dashboard.render.com

---

## ✅ TEST (5 minutes)

1. Open your production dashboard
2. Go to **Patients** page
3. Click **Chat** on any patient
4. Send a test message
5. Check WhatsApp ✅

---

## 📱 What to Look For

- ✅ Chat button appears
- ✅ Modal opens
- ✅ Can send message
- ✅ Status changes to "Manual Chat"
- ✅ Patient receives on WhatsApp
- ✅ AI doesn't respond (paused)

---

## 🎉 That's It!

**Total Time**: ~15 minutes
**Risk**: Low (no breaking changes)
**Rollback**: Easy (git revert)

---

**Good luck! 🚀**
