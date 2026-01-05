import { useProfile } from '@linode/queries';
import { loadScript } from '@linode/utilities';
import { useLocation } from '@tanstack/react-router';
import React from 'react';

import { ADOBE_ANALYTICS_URL } from 'src/constants';
import { reportException } from 'src/exceptionReporting';

/**
 * Initializes our Adobe Analytics script on mount and subscribes to page view events.
 * The EUUID is read from the profile data (injected by the injectEuuidToProfile interceptor).
 */
export const useAdobeAnalytics = () => {
  const location = useLocation();
  const { data: profile } = useProfile();
  const euuid = profile?.euuidFromHttpHeader;

  React.useEffect(() => {
    // Load Adobe Analytics Launch Script
    if (ADOBE_ANALYTICS_URL) {
      loadScript(ADOBE_ANALYTICS_URL, { location: 'head' })
        .then((data) => {
          // Log a Sentry error if the Launch script isn't ready or the _satellite object isn't present in the DOM.
          if (data.status !== 'ready' || !window._satellite) {
            reportException(
              'Adobe Analytics error: Not all Adobe Launch scripts and extensions were loaded correctly; analytics cannot be sent.'
            );
          }

          // Fire the first page view for the landing page
          window._satellite.track('page view', {
            url: window.location.pathname,
            ...(euuid && { euuid }),
          });
        })
        .catch(() => {
          // Do nothing; a user may have analytics script requests blocked.
        });
    }
  }, []);

  React.useEffect(() => {
    /**
     * Send pageviews when location changes.
     * Includes EUUID (Enterprise UUID) if available from the profile response.
     */
    if (window._satellite) {
      window._satellite.track('page view', {
        url: location.pathname,
        ...(euuid && { euuid }),
      });
    }
  }, [location.pathname]); // Listen to location changes

  return null;
};
