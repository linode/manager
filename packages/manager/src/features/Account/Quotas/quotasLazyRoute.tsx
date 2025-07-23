import { createLazyRoute, Navigate } from '@tanstack/react-router';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { Quotas } from './Quotas';

const QuotasComponent = () => {
  const flags = useFlags();
  const showQuotasTab = flags.limitsEvolution?.enabled ?? false;

  if (!showQuotasTab) {
    return <Navigate to="/account" />;
  }

  return <Quotas />;
};

export const quotasLazyRoute = createLazyRoute('/account/quotas')({
  component: QuotasComponent,
});
