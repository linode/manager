import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { QueryClient, QueryClientProvider } from '@linode/queries'
import { light, ThemeProvider } from '@linode/ui';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={light}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
