# Developer Setup Guide

This guide is for developers who want to test the CloudPulse package locally during development or PR review.

---

## Quick Start Approach

### Prerequisites
- A Linode account with access to at least one database
- An authentication token from Cloud Manager

### Steps

1. **Clone and build the package:**
   ```bash
   git checkout <this-branch>
   pnpm install && pnpm bootstrap
   cd packages/cloudpulse
   pnpm install && pnpm build
   ```

2. **Create a test app:**
   ```bash
   # In a separate directory
   npm create vite@latest cloudpulse-demo -- --template react-ts
   cd cloudpulse-demo
   pnpm install
   ```

3. **Install peer dependencies:**
   ```bash
   pnpm add @mui/material@7.3.11 @tanstack/react-query@5.51.24 \
     react-redux@7.1.3 redux@4.0.4 @akamai/compute-ui-core@latest
   ```

4. **Link the CloudPulse package:**
   ```bash
   pnpm link /path/to/cloud-manager/packages/cloudpulse
   ```

5. **Update `vite.config.ts`** to dedupe React:
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     resolve: {
       dedupe: ['react', 'react-dom']
     }
   });
   ```

6. **Replace `src/App.tsx`** with:
   ```tsx
   import { CloudPulseContextualDashboard } from '@akamai/cloudpulse';

   function App() {
     return (
       <div style={{ padding: '20px' }}>
         <h1>CloudPulse Dashboard Test</h1>
         <CloudPulseContextualDashboard
           resource={YOUR_DATABASE_ID}  // Replace with your database ID
           serviceType="dbaas"
           environment="production"
         />
       </div>
     );
   }

   export default App;
   ```

7. **Start the dev server:**
   ```bash
   pnpm dev
   ```

8. **Set auth token in browser console:**
   - Open DevTools → Console
   - Run: `localStorage.setItem('authentication/token', 'Bearer YOUR_TOKEN')`
   - Refresh the page

### Getting Your Test Values

**Database ID:**
- Log into https://cloud.linode.com/databases
- Click any database
- The ID is in the URL: `.../databases/mysql/12345` → use `12345`

**Auth Token:**
- In Cloud Manager, open DevTools → Application → Local Storage
- Copy the value of `authentication/token` (includes `Bearer` prefix)
- OR create a Personal Access Token at https://cloud.linode.com/profile/tokens

---

## 🧪 Alternative: Test in compute-ui-databases

If you already have `compute-ui-databases` set up:

1. **Link CloudPulse:**
   ```bash
   cd compute-ui-databases
   pnpm link /path/to/cloud-manager/packages/cloudpulse
   ```

2. **Add to any page:**
   ```tsx
   import { CloudPulseContextualDashboard } from '@akamai/cloudpulse';
   
   <CloudPulseContextualDashboard
     resource={dbId}
     serviceType="dbaas"
     environment="production"
   />
   ```

3. **Add dedupe to `vite.config.ts`:**
   ```typescript
   resolve: {
     dedupe: ['react', 'react-dom']
   }
   ```

That's it! The compute-ui-databases app already has OAuth set up.

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `pnpm link` again with correct path |
| Multiple React warnings | Add `dedupe: ['react', 'react-dom']` to Vite config |
| 401 Unauthorized | Check your token in localStorage |
| No metrics showing | Verify the resource ID exists and you have access |
---