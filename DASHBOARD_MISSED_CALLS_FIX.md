# Dashboard - Missed Calls Card Fix

## Issue
The "Missed Calls Recovered" card was showing a static number "5" for all users, which was misleading since the call tracking feature hasn't been implemented yet.

## Solution Applied
Updated the card to show "0" with a "Coming Soon" badge to indicate the feature is under development.

## Changes Made

### 1. Updated Stats Value
```typescript
// Before
missedCallsRecovered: 5, // Demo value

// After
missedCallsRecovered: 0, // Feature not yet implemented
```

### 2. Visual Updates
- **Number Color**: Changed from `text-gray-800` (dark) to `text-gray-400` (lighter) to indicate inactive state
- **Icon Opacity**: Added `opacity-50` to the phone icon to show it's not active
- **Badge Added**: Purple "Coming Soon" badge below the number
  - Background: `bg-purple-100`
  - Text: `text-purple-700`
  - Style: Small rounded pill badge

### 3. UI Design
```
┌─────────────────────────────────┐
│ Missed Calls Recovered          │
│                                 │
│ 0 (lighter gray)          📞   │
│                        (faded)  │
│ [Coming Soon]                   │
│  (purple badge)                 │
└─────────────────────────────────┘
```

## Visual Appearance

**Before:**
- Bold black "5"
- No indication it's a placeholder
- Looked like real data

**After:**
- Lighter gray "0"
- Purple "Coming Soon" badge
- Faded icon
- Clear indication feature is pending

## Code Changes

### File: `shubhstra-dashboard/app/page.tsx`

#### Change 1: Stats Initialization
```typescript
setStats({
  totalPatients: patientsCount || 0,
  todayAppointments: todayCount || 0,
  missedCallsRecovered: 0, // Feature not yet implemented
});
```

#### Change 2: Card UI
```tsx
<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 relative">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Missed Calls Recovered</p>
      <p className="text-3xl font-bold text-gray-400 mt-2">{stats.missedCallsRecovered}</p>
      <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
        Coming Soon
      </span>
    </div>
    <div className="bg-purple-100 rounded-full p-3 opacity-50">
      {/* Phone icon */}
    </div>
  </div>
</div>
```

## Future Implementation

When the Android App call tracking feature is ready:

1. **Remove the "Coming Soon" badge**
2. **Change number color back to `text-gray-800`**
3. **Remove icon opacity** (`opacity-50`)
4. **Fetch real data** from the backend API:
   ```typescript
   // Fetch missed calls count from API
   const response = await fetch('http://localhost:3000/api/missed-calls/count');
   const { count } = await response.json();
   
   setStats({
     ...stats,
     missedCallsRecovered: count,
   });
   ```

## Related Features (Pending)

The Missed Calls feature requires:
- ✅ Backend API endpoint (`/api/missed-calls`)
- ⏳ Android App integration for call detection
- ⏳ WhatsApp message automation on missed call
- ⏳ Database tracking of recovered calls

## Testing

- [x] Card displays "0" instead of "5"
- [x] "Coming Soon" badge is visible
- [x] Number appears in lighter gray
- [x] Icon is slightly faded
- [x] Card is not clickable (no misleading interaction)
- [x] No TypeScript errors
- [x] Responsive design maintained

## Status
✅ **FIXED** - Dashboard now accurately represents the feature status

---

**Date Fixed**: February 10, 2026  
**File Modified**: `shubhstra-dashboard/app/page.tsx`  
**Impact**: Improved user experience and transparency
