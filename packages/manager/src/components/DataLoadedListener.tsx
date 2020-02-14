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
    const smaad = shouldMarkAppAsDone(
      props.profileLoadedOrErrorExists,
      props.accountLoadedOrErrorExists,
      props.linodesLoadedOrErrorExists,
      props.volumesLoadedOrErrorExists,
      props.nodeBalancersLoadedOrErrorExists,
      props.bucketsLoadedOrErrorExists,
      props.domainsLoadedOrErrorExists,
      props.accountSettingsLoadedOrErrorExists,
      props.flagsHaveLoaded
    );
    // Uncomment this to see what is loaded along the time of the app load
    // const d =new Date();
    // console.log('should mark app as done ',d.getSeconds(), d.getMilliseconds(), smaad, {
    //   "profileLoadedOrErrorExists":props.profileLoadedOrErrorExists,
    //   "accountLoadedOrErrorExists":props.accountLoadedOrErrorExists,
    //   "linodesLoadedOrErrorExists":props.linodesLoadedOrErrorExists,
    //   "volumesLoadedOrErrorExists":props.volumesLoadedOrErrorExists,
    //   "nodeBalancersLoadedOrErrorExists":props.nodeBalancersLoadedOrErrorExists,
    //   "bucketsLoadedOrErrorExists":props.bucketsLoadedOrErrorExists,
    //   "domainsLoadedOrErrorExists":props.domainsLoadedOrErrorExists,
    //   "accountSettingsLoadedOrErrorExists":props.accountSettingsLoadedOrErrorExists,
    //   "flagsHaveLoaded":props.flagsHaveLoaded
    // });
    if (smaad) {
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
    linodesLoadedOrErrorExists &&
    volumesLoadedOrErrorExists &&
    nodeBalancersLoadedOrErrorExists &&
    // accountLoadedOrErrorExists &&
    profileLoadedOrErrorExists &&
    domainsLoadedOrErrorExists
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
    return true;
  }

  // Object Storage endpoints will typically be a bit slower, so for these
  // components, go ahead and render the app and reply on other loading states.
  if (pathname.match(/object/i)) {
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
