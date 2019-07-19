/**
 * the point of this component is to check the user's URL location pathname
 * and check if this appropriate data is loaded. If so, render the app,
 * if not, the SplashScreen.tsx will still be rendering.
 */

import * as React from 'react';
import { compose } from 'recompose';

interface Props {
  profileDataExists: boolean;
  accountDataExists: boolean;
  linodesDataExists: boolean;
  volumesDataExists: boolean;
  nodeBalancersDataExists: boolean;
  bucketsDataExists: boolean;
  domainsDataExists: boolean;
  markAppAsLoaded: () => void;
  appIsLoaded: boolean;
}

const DataLoadedListener: React.FC<Props> = props => {
  React.useEffect(() => {
    if (
      shouldMarkAppAsDone(
        props.profileDataExists,
        props.accountDataExists,
        props.linodesDataExists,
        props.volumesDataExists,
        props.nodeBalancersDataExists,
        props.bucketsDataExists,
        props.domainsDataExists
      ) &&
      !props.appIsLoaded
    ) {
      props.markAppAsLoaded();
    }
  });

  return null;
};

export default compose<Props, Props>(React.memo)(DataLoadedListener);

const shouldMarkAppAsDone = (
  profileDataExists: boolean,
  accountDataExists: boolean,
  linodesDataExists: boolean,
  volumesDataExists: boolean,
  nodeBalancersDataExists: boolean,
  bucketsDataExists: boolean,
  domainsDataExists: boolean
): boolean => {
  const pathname = window.location.pathname;

  if (
    pathname.match(/dashboard/i) &&
    (linodesDataExists &&
      volumesDataExists &&
      nodeBalancersDataExists &&
      accountDataExists &&
      profileDataExists &&
      domainsDataExists)
    /** not checking bucket data here for now */
  ) {
    return true;
  }

  if (pathname.match(/linode/i) && !!linodesDataExists) {
    return true;
  }

  if (pathname.match(/volume/i) && !!volumesDataExists) {
    return true;
  }

  if (pathname.match(/nodebalancer/i) && !!nodeBalancersDataExists) {
    return true;
  }

  if (pathname.match(/domain/i) && !!domainsDataExists) {
    return true;
  }

  if (pathname.match(/object/i) && !!bucketsDataExists) {
    return true;
  }

  if (pathname.match(/profile/i) && !!profileDataExists) {
    return true;
  }

  if (pathname.match(/account/i) && !!accountDataExists) {
    return true;
  }

  return false;
};
