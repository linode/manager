import React from 'react';

import { isParentTokenValid } from 'src/features/Account/utils';

export const useParentTokenManagement = ({
  isProxyUser,
}: {
  isProxyUser: boolean;
}) => {
  const [isParentTokenExpired, setIsParentTokenExpired] = React.useState(false);

  if (isProxyUser) {
    const isExpired = !isParentTokenValid();
    setIsParentTokenExpired(isExpired);
  }

  return { isParentTokenExpired };
};
