import React, { useEffect } from 'react';

import { SplashScreen } from 'src/components/SplashScreen';

import { oauthClient } from './oauth';

export const Logout = () => {
  useEffect(() => {
    oauthClient.logout();
  }, []);

  return <SplashScreen />;
};
