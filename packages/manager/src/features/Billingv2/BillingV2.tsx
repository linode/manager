import { Navigate } from '@tanstack/react-router';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

export const BillingV2 = () => {
  const flags = useFlags();

  const isIAMRbacPrimaryNavChangesEnabled = flags?.iamRbacPrimaryNavChanges;

  if (!isIAMRbacPrimaryNavChangesEnabled) {
    return <Navigate to="/account/billing" />;
  }
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Billing V2 Page</h1>
      <p>This is the new billing page (dummy component).</p>
    </div>
  );
};
