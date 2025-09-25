import { createRoot } from 'react-dom/client';
import App from './App';
import React from 'react';
import { light, ThemeProvider } from '@linode/ui';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={light}>
    <App />
  </ThemeProvider>
)
