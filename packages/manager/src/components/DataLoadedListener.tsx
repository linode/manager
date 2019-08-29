/**
 * the point of this component is to check the user's URL location pathname
 * and check if this appropriate data is loaded. If so, render the app,
 * if not, the SplashScreen.tsx will still be rendering.
 */

import * as React from 'react';
import { compose } from 'recompose';

interface Props {
  profileLoadingOrErrorExists: boolean;
  accountLoadingOrErrorExists: boolean;
  linodesLoadingOrErrorExists: boolean;
  volumesLoadingOrErrorExists: boolean;
  nodeBalancersLoadingOrErrorExists: boolean;
  bucketsLoadingOrErrorExists: boolean;
  domainsLoadingOrErrorExists: boolean;
  markAppAsLoaded: () => void;
  appIsLoaded: boolean;
  flagsHaveLoaded: boolean;
}

const DataLoadedListener: React.FC<Props> = props => {
  React.useEffect(() => {
    if (
      shouldMarkAppAsDone(
        props.profileLoadingOrErrorExists,
        props.accountLoadingOrErrorExists,
        props.linodesLoadingOrErrorExists,
        props.volumesLoadingOrErrorExists,
        props.nodeBalancersLoadingOrErrorExists,
        props.bucketsLoadingOrErrorExists,
        props.domainsLoadingOrErrorExists,
        props.flagsHaveLoaded
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
  profileLoadingOrErrorExists: boolean,
  accountLoadingOrErrorExists: boolean,
  linodesLoadingOrErrorExists: boolean,
  volumesLoadingOrErrorExists: boolean,
  nodeBalancersLoadingOrErrorExists: boolean,
  bucketsLoadingOrErrorExists: boolean,
  domainsLoadingOrErrorExists: boolean,
  flagsHaveLoaded: boolean
): boolean => {
  const pathname = window.location.pathname;

  if (!flagsHaveLoaded) {
    // We're still waiting for feature flags. Don't load the app.
    return false;
  }

  /**
   * if we're not on a route that we recognize,
   * just return true and show the app.
   */
  if (
    [
      'dashboard',
      'linode',
      'volume',
      'nodebalancer',
      'object',
      'profile',
      'account'
    ].every(eachStr => {
      return !pathname.match(new RegExp(eachStr, 'i'));
    })
  ) {
    return true;
  }

  if (
    pathname.match(/dashboard/i) &&
    (linodesLoadingOrErrorExists &&
      volumesLoadingOrErrorExists &&
      nodeBalancersLoadingOrErrorExists &&
      accountLoadingOrErrorExists &&
      profileLoadingOrErrorExists &&
      domainsLoadingOrErrorExists)
    /** not checking bucket data here for now */
  ) {
    return true;
  }

  if (pathname.match(/linode/i) && !!linodesLoadingOrErrorExists) {
    return true;
  }

  if (pathname.match(/volume/i) && !!volumesLoadingOrErrorExists) {
    return true;
  }

  if (pathname.match(/nodebalancer/i) && !!nodeBalancersLoadingOrErrorExists) {
    return true;
  }

  if (pathname.match(/domain/i) && !!domainsLoadingOrErrorExists) {
    return true; // This doesn't do anything as there's no action to request Domains
  }

  if (pathname.match(/object/i) && !!bucketsLoadingOrErrorExists) {
    return true;
  }

  if (pathname.match(/profile/i) && !!profileLoadingOrErrorExists) {
    return true;
  }

  if (pathname.match(/account/i) && !!accountLoadingOrErrorExists) {
    return true;
  }

  return false;
};
