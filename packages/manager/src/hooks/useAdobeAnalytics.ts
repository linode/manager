import { loadScript } from '@linode/utilities'; // `loadScript` from `useScript` hook
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ADOBE_ANALYTICS_URL } from 'src/constants';
import { reportException } from 'src/exceptionReporting';

/**
 * Initializes our Adobe Analytics script on mount and subscribes to page view events.
 */
export const useAdobeAnalytics = () => {
  const history = useHistory();

  React.useEffect(() => {
    // Load Adobe Analytics Launch Script
    if (ADOBE_ANALYTICS_URL) {
      loadScript(ADOBE_ANALYTICS_URL, { location: 'head' })
        .then((data) => {
          // Log an error; if the promise resolved and the _satellite object should be present in the DOM.
          if (data.status !== 'ready' || !window._satellite) {
            reportException(
              'Adobe Analytics error: Not all Adobe Launch scripts and extensions were loaded correctly; analytics cannot be sent.'
            );
          }

          // Fire the first page view for the landing page
          window._satellite.track('page view', {
            url: window.location.pathname,
          });
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
      if (window._satellite) {
        window._satellite.track('page view', {
          url: pathname,
        });
      }
    });
  }, [history]);

  return null;
};
