import React from 'react';

import { loadScript } from './useScript';

export const useNewRelic = () => {
  React.useEffect(() => {
    if (import.meta.env.PROD && !import.meta.env.REACT_APP_DISABLE_NEW_RELIC) {
      loadScript('/new-relic.js');
    }
  }, []);
};
