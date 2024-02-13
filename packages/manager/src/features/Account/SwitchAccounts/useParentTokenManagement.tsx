import React from 'react';

import { isParentTokenValid } from 'src/features/Account/utils';

// Checks and reacts to the expiration status of parent tokens.
export const useParentTokenManagement = ({
  isProxyUser,
}: {
  isProxyUser: boolean;
}) => {
  const [isParentTokenExpired, setIsParentTokenExpired] = React.useState(false);

  React.useEffect(() => {
    if (isProxyUser) {
      const isExpired = !isParentTokenValid();
      setIsParentTokenExpired(isExpired);
    }
  }, [isProxyUser]);

  return { isParentTokenExpired };
};
