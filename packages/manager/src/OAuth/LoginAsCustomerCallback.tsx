import React, { useEffect } from 'react';
import type { RouteComponentProps } from 'react-router-dom';

import { SplashScreen } from 'src/components/SplashScreen';
import { handleLoginAsCustomerCallback } from 'src/OAuth/utils';

/**
 * This component is similar to the OAuth comonent, in that it's main
 * purpose is to consume the data given from the hash params provided from
 * where the user was navigated from. In the case of this component, the user
 * was navigated from Admin and the query params differ from what they would be
 * if the user was navgiated from Login. Further, we are doing no nonce checking here.
 *
 * Admin will redirect to Cloud Manager with a URL like:
 * https://cloud.linode.com/admin/callback#access_token=fjhwehkfg&destination=dashboard&token_type=Admin
 */
export const LoginAsCustomerCallback = (props: RouteComponentProps) => {
  useEffect(() => {
    handleLoginAsCustomerCallback({
      onSuccess(returnTo) {
        props.history.push(returnTo);
      },
    });
  }, []);

  return <SplashScreen />;
};
