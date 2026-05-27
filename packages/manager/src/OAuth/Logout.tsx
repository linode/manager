import React, { useEffect } from 'react';

import { SplashScreen } from 'src/components/SplashScreen';
import { clearUserInput } from 'src/utilities/storage';

import { oauthClient } from './oauthClient';

export const Logout = () => {
  useEffect(() => {
    clearUserInput();
    oauthClient.logout();
  }, []);

  return <SplashScreen />;
};
