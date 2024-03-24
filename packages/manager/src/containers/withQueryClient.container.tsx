import { QueryClient, useQueryClient } from '@tanstack/react-query';
import React from 'react';

export interface WithQueryClientProps {
  queryClient: QueryClient;
}

interface ComponentProps<P> extends WithQueryClientProps {
  componentProps: P;
}

export const withQueryClient = <P extends {}>(
  Component: React.ComponentType<ComponentProps<P>>
) => (props: P) => (
  <Component componentProps={props} queryClient={useQueryClient()} />
);
