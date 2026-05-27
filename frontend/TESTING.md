# Manual Testing Guide - Site & Meter Filters

This guide provides step-by-step instructions for manually testing the site and meter filter components.

## Prerequisites

1. Backend API server running and accessible
2. Frontend development server running (`npm run dev`)
3. User logged in to the application
4. `/api/meters` endpoint returning valid data with meters and sites

## Test Checklist

### ✅ Filters fetch data from `/api/meters` on mount

**Steps:**
1. Navigate to `/dashboard` page
2. Open browser DevTools (F12) → Network tab
3. Filter by "Fetch/XHR" requests
4. Look for a request to `/api/meters`

**Expected Results:**
- Request to `/api/meters` appears in Network tab
- Request returns 200 status code
- Site and Meter dropdowns are populated with data
- No console errors

**How to Verify:**
- Check Network tab for successful API call
- Verify dropdowns show site and meter names (not "Loading...")
- Check browser console for any errors

---

### ✅ Site selection filters meter dropdown

**Steps:**
1. On Dashboard page, observe the Meter dropdown (should be disabled initially)
2. Select a site from the Site dropdown
3. Observe the Meter dropdown

**Expected Results:**
- Meter dropdown becomes enabled after site selection
- Meter dropdown only shows meters belonging to the selected site
- Meter dropdown shows "-- Select a meter --" as first option
- If site is cleared, meter dropdown becomes disabled again

**How to Verify:**
- Select Site 1 → Verify only Site 1's meters appear in Meter dropdown
- Select Site 2 → Verify Meter dropdown updates to show only Site 2's meters
- Clear site selection → Verify Meter dropdown becomes disabled

---

### ✅ Filter changes update URL params (`?site=1&meter=2`)

**Steps:**
1. Navigate to `/dashboard` (no query params)
2. Select a site from Site dropdown
3. Observe the browser address bar
4. Select a meter from Meter dropdown
5. Observe the browser address bar again

**Expected Results:**
- After selecting site: URL shows `?site=1` (or appropriate site ID)
- After selecting meter: URL shows `?site=1&meter=2` (or appropriate IDs)
- URL updates without page reload
- Browser history is updated (can use back button)

**How to Verify:**
- Check address bar shows `?site=X` after site selection
- Check address bar shows `?site=X&meter=Y` after meter selection
- Verify page doesn't reload when filters change
- Use browser back button to verify history works

---

### ✅ URL params on page load populate filters correctly

**Steps:**
1. Manually navigate to `/dashboard?site=1&meter=2` (use valid IDs from your data)
2. Observe the Site and Meter dropdowns
3. Try with invalid params: `/dashboard?site=999&meter=999`
4. Try with partial params: `/dashboard?site=1` (no meter)

**Expected Results:**
- Site dropdown shows the selected site (ID from URL)
- Meter dropdown shows the selected meter (ID from URL)
- Invalid IDs are ignored (dropdowns show default state)
- Partial params work correctly (only site selected, meter disabled)

**How to Verify:**
- Valid params: Both dropdowns show correct selections
- Invalid params: Dropdowns show default state, no errors
- Partial params: Site selected, meter dropdown enabled but no meter selected

---

### ✅ Chart data updates when filters change

**Steps:**
1. Select a site and meter
2. Wait for chart to load and display data
3. Change to a different site
4. Observe the chart
5. Change to a different meter (same site)
6. Observe the chart again

**Expected Results:**
- Chart shows loading state when filters change
- Chart updates with new data after API call completes
- Chart displays data points for the selected site/meter
- KPI cards also update with new data

**How to Verify:**
- See loading spinner when changing filters
- Chart content changes to reflect new selection
- KPI cards show updated values
- Check Network tab for new `/api/metrics` requests

---

### ✅ Browser back/forward navigation works

**Steps:**
1. Navigate to `/dashboard`
2. Select Site 1 → Meter 1
3. Select Site 2 → Meter 2
4. Click browser Back button
5. Observe URL and filters
6. Click browser Forward button
7. Observe URL and filters again

**Expected Results:**
- Back button restores previous filter selections
- Forward button restores forward filter selections
- URL params match filter selections
- Chart data updates to match restored filters

**How to Verify:**
- Back button: URL shows previous params, filters match, chart updates
- Forward button: URL shows forward params, filters match, chart updates
- No page reload occurs during navigation

---

## Edge Cases to Test

### Invalid URL Parameters
- `/dashboard?site=abc&meter=xyz` - Non-numeric values should be ignored
- `/dashboard?site=&meter=` - Empty values should be ignored
- `/dashboard?site=-1&meter=-1` - Negative values should be ignored

### Missing Data Scenarios
- Empty meters list - Should show appropriate message
- API error - Should show error state in filters
- Network failure - Should handle gracefully

### Filter Interactions
- Select site → Select meter → Clear site → Meter should clear automatically
- Select site → Select meter → Change site → Meter should reset if invalid for new site
- Select meter without site - Should not be possible (meter disabled)

### Time Range Interaction
- Change time range with filters selected - Chart should update
- Filters persist when changing time range

---

## Browser Compatibility

Test in the following browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

## Troubleshooting

**Filters not loading:**
- Check Network tab for `/api/meters` request
- Verify API endpoint is accessible
- Check browser console for errors

**URL params not updating:**
- Verify React Router is properly configured
- Check browser console for errors
- Ensure `useSearchParams` is working

**Chart not updating:**
- Check Network tab for `/api/metrics` requests
- Verify filters are being passed correctly
- Check browser console for errors

---

## Notes

- All tests assume valid authentication
- API endpoints must be running and accessible
- Use real site/meter IDs from your database for testing
- Network throttling can be used to test loading states

