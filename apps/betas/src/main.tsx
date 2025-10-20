import App from './App';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { light, ThemeProvider, CssBaseline } from '@linode/ui';
import { AuthProvider } from '@linode/oauth';
import { oauthClient } from './oauth';

/**
 * main.tsx (this file) is the entry point when this app is ran standalone (without a host)
 * App.tsx is the entry point when this app is consumed by a host (using Module Federation)
 *
 * AuthProvider and ThemeProvider are here because they are needed in stadalone mode.
 * In cases of Module Federation, the host will provide these contexts so they are here rather than in App.tsx
 */
createRoot(document.getElementById('root')!).render(
  <AuthProvider client={oauthClient}>
    <ThemeProvider theme={light}>
      <CssBaseline enableColorScheme />
      <App />
    </ThemeProvider>
  </AuthProvider>
)
