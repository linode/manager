import * as React from 'react';

import { SplashScreen } from 'src/components/SplashScreen';
import { logout } from 'src/OAuth/utils';

export const Logout = () => {
  React.useEffect(() => {
    logout();
  }, []);

  return <SplashScreen />;
};
