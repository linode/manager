import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

import type { QueryClient } from '@tanstack/react-query';

export interface WithQueryClientProps {
  queryClient: QueryClient;
}

export const withQueryClient =
  <Props extends {}>(
    Component: React.ComponentType<Props & WithQueryClientProps>
  ) =>
  (props: Props) => <Component {...props} queryClient={useQueryClient()} />;
