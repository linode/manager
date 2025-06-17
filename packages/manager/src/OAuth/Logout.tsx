import React, { useEffect } from 'react';

import { SplashScreen } from 'src/components/SplashScreen';
import { logout } from 'src/OAuth/utils';

export const Logout = () => {
  useEffect(() => {
    logout();
  }, []);

  return <SplashScreen />;
};
