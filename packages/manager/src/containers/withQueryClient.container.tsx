import { QueryClient, useQueryClient } from '@tanstack/react-query';
import React from 'react';

export interface WithQueryClientProps {
  queryClient: QueryClient;
}

export const withQueryClient = <P extends {}>(
  Component: React.ComponentType<WithQueryClientProps>
) => (props: P) => <Component {...props} queryClient={useQueryClient()} />;
