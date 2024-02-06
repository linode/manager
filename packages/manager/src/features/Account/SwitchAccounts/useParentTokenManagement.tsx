import React from 'react';

import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { isParentTokenValid } from 'src/features/Account/utils';

export const useParentTokenManagement = ({
  isProxyUser,
}: {
  isProxyUser: boolean;
}) => {
  const [isParentTokenExpired, setIsParentTokenExpired] = React.useState(false);
  const sessionContext = React.useContext(switchAccountSessionContext);

  const checkParentToken = async () => {
    const isExpired = !isParentTokenValid();
    setIsParentTokenExpired(isExpired);
  };

  React.useEffect(() => {
    if (isProxyUser) {
      checkParentToken();
    }
  }, [isProxyUser]);

  React.useEffect(() => {
    if (isParentTokenExpired && sessionContext.continueSession === false) {
      sessionContext.updateState({ continueSession: true, isOpen: true });
    }
  }, [isParentTokenExpired, sessionContext]);

  return { isParentTokenExpired };
};
