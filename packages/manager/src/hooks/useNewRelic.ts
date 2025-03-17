import { loadScript } from '@linode/utilities'; // `loadScript` from `useScript` hook
import React from 'react';

/**
 * Loads the New Relic agent on mount.
 *
 * New Relic will load if
 * - You are using a Cloud Manager production build
 * - It is not explictly disabled with `REACT_APP_DISABLE_NEW_RELIC`
 */
export const useNewRelic = () => {
  React.useEffect(() => {
    if (import.meta.env.PROD && !import.meta.env.REACT_APP_DISABLE_NEW_RELIC) {
      loadScript('/new-relic.js');
    }
  }, []);

  return null;
};
