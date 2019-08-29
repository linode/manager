/**
 * the point of this component is to check the user's URL location pathname
 * and check if this appropriate data is loaded. If so, render the app,
 * if not, the SplashScreen.tsx will still be rendering.
 */

import * as React from 'react';
import { compose } from 'recompose';

interface Props {
  profileLoadedOrErrorExists: boolean;
  accountLoadedOrErrorExists: boolean;
  linodesLoadedOrErrorExists: boolean;
  volumesLoadedOrErrorExists: boolean;
  nodeBalancersLoadedOrErrorExists: boolean;
  bucketsLoadedOrErrorExists: boolean;
  domainsLoadedOrErrorExists: boolean;
  accountSettingsLoadedOrErrorExists: boolean;
  markAppAsLoaded: () => void;
  appIsLoaded: boolean;
  flagsHaveLoaded: boolean;
}

const DataLoadedListener: React.FC<Props> = props => {
  React.useEffect(() => {
    if (
      shouldMarkAppAsDone(
        props.profileLoadedOrErrorExists,
        props.accountLoadedOrErrorExists,
        props.linodesLoadedOrErrorExists,
        props.volumesLoadedOrErrorExists,
        props.nodeBalancersLoadedOrErrorExists,
        props.bucketsLoadedOrErrorExists,
        props.domainsLoadedOrErrorExists,
        props.accountSettingsLoadedOrErrorExists,
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
  profileLoadedOrErrorExists: boolean,
  accountLoadedOrErrorExists: boolean,
  linodesLoadedOrErrorExists: boolean,
  volumesLoadedOrErrorExists: boolean,
  nodeBalancersLoadedOrErrorExists: boolean,
  bucketsLoadedOrErrorExists: boolean,
  domainsLoadedOrErrorExists: boolean,
  accountSettingsLoadedOrErrorExists: boolean,
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
      'account',
      'managed'
    ].every(eachStr => {
      return !pathname.match(new RegExp(eachStr, 'i'));
    })
  ) {
    return true;
  }

  if (
    pathname.match(/dashboard/i) &&
    (linodesLoadedOrErrorExists &&
      volumesLoadedOrErrorExists &&
      nodeBalancersLoadedOrErrorExists &&
      accountLoadedOrErrorExists &&
      profileLoadedOrErrorExists &&
      domainsLoadedOrErrorExists)
    /** not checking bucket data here for now */
  ) {
    return true;
  }

  if (pathname.match(/linode/i) && !!linodesLoadedOrErrorExists) {
    return true;
  }

  if (pathname.match(/volume/i) && !!volumesLoadedOrErrorExists) {
    return true;
  }

  if (pathname.match(/nodebalancer/i) && !!nodeBalancersLoadedOrErrorExists) {
    return true;
  }


  if (pathname.match(/domain/i) && !!domainsLoadedOrErrorExists) {
    return true; // This doesn't do anything as there's no action to request Domains


  if (pathname.match(/object/i) && !!bucketsLoadedOrErrorExists) {
    return true;
  }

  if (pathname.match(/profile/i) && !!profileLoadedOrErrorExists) {
    return true;
  }

  if (pathname.match(/account/i) && !!accountLoadedOrErrorExists) {
    return true;
  }

  if (pathname.match(/managed/i) && !!accountSettingsLoadedOrErrorExists) {
    return true;
  }

  return false;
};
