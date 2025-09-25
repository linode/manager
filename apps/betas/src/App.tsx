import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { QueryClient, QueryClientProvider } from '@linode/queries'
import React from 'react';
import { APIError, baseRequest } from '@linode/api-v4';

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
  return Promise.reject(errors);
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
