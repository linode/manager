import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { QueryClient, QueryClientProvider } from '@linode/queries'
import React from 'react';
import { baseRequest } from '@linode/api-v4';

const queryClient = new QueryClient();

baseRequest.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authentication/token');

  if (token) {
    config.headers.setAuthorization(token);
  }

  return config;
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
