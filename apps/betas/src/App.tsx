import React from 'react';
import { APIError, baseRequest } from '@linode/api-v4';
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { QueryClient, QueryClientProvider } from '@linode/queries'
import { oauthClient } from './oauth';

const queryClient = new QueryClient();

baseRequest.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authentication/token');

  if (token) {
    config.headers.setAuthorization(token);
  }

  return config;
});

baseRequest.interceptors.response.use(undefined, (error) => {
  const errors: APIError[] = error.response?.data?.errors ?? [
    { reason: "Unexpected Error" },
  ];
  if (error.status === 401) {
    oauthClient.login();
  }
  return Promise.reject(errors);
});

/**
 * main.tsx is the entry point when this app is ran standalone (without a host)
 * App.tsx (this file) is the entry point when this app is consumed by a host (using Module Federation)
 *
 * QueryClientProvider is here because this app always uses it's own React Query cache.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
