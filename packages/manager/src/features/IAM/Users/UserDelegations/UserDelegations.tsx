import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

export const UserDelegations = () => {
  const flags = useFlags();
  const isIAMDelegationEnabled = flags?.iamDelegation?.enabled;

  if (!isIAMDelegationEnabled) {
    return null;
  }

  return <div>Account Delegations</div>;
};
