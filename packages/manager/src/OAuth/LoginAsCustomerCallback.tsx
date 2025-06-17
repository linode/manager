import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import type { RouteComponentProps } from 'react-router-dom';

import { SplashScreen } from 'src/components/SplashScreen';
import { handleLoginAsCustomerCallback } from 'src/OAuth/oauth';

/**
 * This component is similar to the OAuth comonent, in that it's main
 * purpose is to consume the data given from the hash params provided from
 * where the user was navigated from. In the case of this component, the user
 * was navigated from Admin and the query params differ from what they would be
 * if the user was navgiated from Login. Further, we are doing no nonce checking here.
 *
 * Admin will redirect to Cloud Manager with a URL like:
 * https://cloud.linode.com/admin/callback#access_token=fjhwehkfg&destination=dashboard&expires_in=900&token_type=Admin
 */
export const LoginAsCustomerCallback = (props: RouteComponentProps) => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    handleLoginAsCustomerCallback({
      params: location.hash.substring(1),
      onSuccess({ returnTo, expiresIn }) {
        props.history.push(returnTo);

        setTimeout(
          () => {
            enqueueSnackbar(
              'Your Cloud Manager session will expire in 1 minute.',
              { variant: 'info' }
            );
          },
          (expiresIn - 60) * 1000
        );
      },
    });
  }, []);

  return <SplashScreen />;
};
