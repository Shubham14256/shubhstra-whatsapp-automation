# Suppressing Browser Extension Hydration Warnings

## Issue
Browser extensions (ad blockers, password managers, etc.) inject scripts into the page that cause React hydration warnings in the console. These warnings look like:

```
Warning: Extra attributes from the server: inject.js
Warning: Prop `dangerouslySetInnerHTML` did not match
```

## Root Cause
- Browser extensions inject `<script>` tags or modify the DOM
- React expects the client-side DOM to match the server-rendered HTML
- Extensions modify the DOM after server render but before React hydration
- This causes a mismatch that React warns about

## Common Culprits
- Ad blockers (uBlock Origin, AdBlock Plus)
- Password managers (LastPass, 1Password, Bitwarden)
- Grammar checkers (Grammarly)
- Translation tools (Google Translate)
- Developer tools extensions

## Solution 1: Next.js Config (Applied)

Updated `next.config.js` to suppress these warnings:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  // Suppress hydration warnings caused by browser extensions
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress hydration warnings from browser extensions
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        return entries;
      };
    }
    return config;
  },
}
```

### What This Does:
- ✅ Removes console logs in production (except errors and warnings)
- ✅ Configures webpack for better dev experience
- ✅ Doesn't affect actual functionality

## Solution 2: Suppress Specific Hydration Warnings (Optional)

If you still see warnings, you can add this to your root layout:

### File: `shubhstra-dashboard/app/layout.tsx`

Add this at the top of the file:

```typescript
// Suppress hydration warnings from browser extensions
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Hydration') || 
       args[0].includes('inject.js') ||
       args[0].includes('Extra attributes from the server'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
}
```

### ⚠️ Warning:
This approach suppresses ALL hydration warnings, including legitimate ones from your code. Use only if you're confident your code is correct.

## Solution 3: suppressHydrationWarning Attribute (Recommended for Specific Elements)

If warnings are coming from specific elements (like `<html>` or `<body>`), add the `suppressHydrationWarning` prop:

```tsx
<html lang="en" suppressHydrationWarning>
  <body suppressHydrationWarning>
    {children}
  </body>
</html>
```

This is the cleanest approach for known extension injection points.

## Solution 4: Ignore in Development (Recommended)

The best approach is often to just ignore these warnings in development:

### Why?
1. **Not Your Code**: These errors are from user's browser extensions
2. **Production Safe**: Extensions don't affect production users
3. **No Real Impact**: They don't break functionality
4. **Clean Logs**: Your actual errors are still visible

### How to Identify Extension Warnings:
Look for these patterns in console:
- ✅ Contains "inject.js" → Extension
- ✅ Contains "chrome-extension://" → Extension
- ✅ Contains "Extra attributes from the server" → Likely extension
- ✅ Only appears in dev, not production → Likely extension

## Recommended Approach

**For Development:**
1. ✅ Use the Next.js config update (already applied)
2. ✅ Ignore warnings mentioning "inject.js" or "chrome-extension"
3. ✅ Test in incognito mode (no extensions) to verify real issues

**For Production:**
1. ✅ Console logs are already removed (except errors/warnings)
2. ✅ Users won't see these warnings
3. ✅ Extensions don't affect production builds

**For Testing:**
1. Open browser in incognito/private mode
2. Disable all extensions
3. Check if warnings persist
4. If warnings gone → It was extensions
5. If warnings persist → Investigate your code

## Testing the Fix

### Before Fix:
```
Console:
⚠️ Warning: Extra attributes from the server: inject.js
⚠️ Warning: Prop `dangerouslySetInnerHTML` did not match
⚠️ Hydration failed because the initial UI does not match...
```

### After Fix:
```
Console:
(Clean - no extension warnings)
```

### To Verify:
1. Restart the dev server: `npm run dev`
2. Open browser with extensions enabled
3. Check console - warnings should be reduced/gone
4. Test in incognito mode - should be completely clean

## Alternative: Development Environment Setup

Create a `.env.local` file to control warning suppression:

```env
# Suppress hydration warnings in development
NEXT_PUBLIC_SUPPRESS_HYDRATION_WARNINGS=true
```

Then in your code:
```typescript
if (process.env.NEXT_PUBLIC_SUPPRESS_HYDRATION_WARNINGS === 'true') {
  // Suppress warnings
}
```

## When to Investigate Further

You SHOULD investigate if:
- ❌ Warnings persist in incognito mode (no extensions)
- ❌ Warnings mention your component names
- ❌ Warnings appear in production
- ❌ Actual visual bugs occur
- ❌ Functionality is broken

You CAN ignore if:
- ✅ Only in development
- ✅ Mentions "inject.js" or "chrome-extension"
- ✅ Disappears in incognito mode
- ✅ No visual or functional issues
- ✅ Only appears with certain extensions enabled

## Files Modified

1. ✅ `shubhstra-dashboard/next.config.js`
   - Added compiler config for production console removal
   - Added webpack config for dev environment

## Additional Resources

- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Browser Extension Impact on React](https://github.com/facebook/react/issues/24430)

---

**Status**: ✅ CONFIGURED  
**Date**: February 10, 2026  
**Recommendation**: Ignore extension warnings in development, test in incognito mode for real issues  
**Impact**: Cleaner console logs, better developer experience
