import React from 'react';

import { isParentTokenValid } from 'src/features/Account/SwitchAccounts/utils';

// Checks and reacts to the expiration status of parent tokens.
export const useIsParentTokenExpired = ({
  isProxyOrDelegateUserType,
}: {
  isProxyOrDelegateUserType: boolean;
}) => {
  const [isParentTokenExpired, setIsParentTokenExpired] = React.useState(false);

  React.useEffect(() => {
    if (isProxyOrDelegateUserType) {
      const isExpired = !isParentTokenValid();
      setIsParentTokenExpired(isExpired);
    }
  }, [isProxyOrDelegateUserType]);

  return { isParentTokenExpired };
};
