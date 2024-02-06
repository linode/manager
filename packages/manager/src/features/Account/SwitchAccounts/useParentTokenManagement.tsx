import React from 'react';

import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { isParentTokenValid } from 'src/features/Account/utils';

export const useParentTokenManagement = ({
  isProxyUser,
}: {
  isProxyUser: boolean;
}) => {
  const [isParentAccountExpired, setIsParentAccountExpired] = React.useState(
    false
  );
  const sessionContext = React.useContext(switchAccountSessionContext);

  const checkParentToken = async () => {
    const isParentTokenExpired = !isParentTokenValid();
    setIsParentAccountExpired(isParentTokenExpired);
  };

  React.useEffect(() => {
    if (isProxyUser) {
      checkParentToken();
    }
  }, [isProxyUser]);

  React.useEffect(() => {
    if (isParentAccountExpired && sessionContext.continueSession === false) {
      sessionContext.updateState({ continueSession: true, isOpen: true });
    }
  }, [isParentAccountExpired, sessionContext]);

  return { isParentAccountExpired };
};
