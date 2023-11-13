import React from 'react';
import { useHistory } from 'react-router-dom';

import { ADOBE_ANALYTICS_URL, NUM_ADOBE_SCRIPTS } from 'src/constants';
import { reportException } from 'src/exceptionReporting';

import { loadScript } from './useScript';

export const useAdobeAnalytics = () => {
  const history = useHistory();

  React.useEffect(() => {
    // Load Adobe Analytics Launch Script
    if (!!ADOBE_ANALYTICS_URL) {
      loadScript(ADOBE_ANALYTICS_URL, { location: 'head' })
        .then((data) => {
          const adobeScriptTags = document.querySelectorAll(
            'script[src^="https://assets.adobedtm.com/"]'
          );
          // Log an error; if the promise resolved, the _satellite object and 3 Adobe scripts should be present in the DOM.
          if (
            data.status !== 'ready' ||
            !(window as any)._satellite ||
            adobeScriptTags.length !== NUM_ADOBE_SCRIPTS
          ) {
            reportException(
              'Adobe Analytics error: Not all Adobe Launch scripts and extensions were loaded correctly; analytics cannot be sent.'
            );
          }
        })
        .catch(() => {
          // Do nothing; a user may have analytics script requests blocked.
        });
    }
  }, []);

  React.useEffect(() => {
    /**
     * Send pageviews
     */
    return history.listen(({ pathname }) => {
      // Send Adobe Analytics page view events
      if ((window as any)._satellite) {
        (window as any)._satellite.track('page view', {
          url: pathname,
        });
      }
    });
  }, [history]);
};
