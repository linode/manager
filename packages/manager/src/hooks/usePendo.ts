import { useAccount, useProfile } from '@linode/queries';
import { loadScript } from '@linode/utilities'; // `loadScript` from `useScript` hook
import React from 'react';

import { PENDO_API_KEY } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { getAppRoot } from 'src/OAuth/constants';
import {
  checkOptanonConsent,
  getCookie,
  ONE_TRUST_COOKIE_CATEGORIES,
} from 'src/utilities/analytics/utils';

declare global {
  interface Window {
    pendo: any;
  }
}

const appRoot = getAppRoot();

/**
 * This function prevents address ID collisions leading to muddled data between environments. Account and visitor IDs must be unique per API-key.
 * See: https://support.pendo.io/hc/en-us/articles/360031862352-Pendo-in-multiple-environments-for-development-and-testing
 * @returns Unique ID for the environment; else, undefined if missing values.
 */
const getUniquePendoId = (id: string | undefined) => {
  const isProdEnv = appRoot === 'https://cloud.linode.com';

  if (!id || !appRoot) {
    return;
  }

  // Append "-nonprod" to all IDs when in lower environments.
  return `${id}${!isProdEnv ? '-nonprod' : ''}`;
};

/**
 * This function uses string matching and replacement to transform the page url into a sanitized url without unwanted data.
 * @param url The url of the page.
 * @returns A clean, transformed url of the page.
 */
export const transformUrl = (url: string) => {
  const idMatchingRegex = /(\/\d+)/g;
  const bucketPathMatchingRegex = /(buckets\/[^\/]+\/[^\/]+)/;
  const userPathMatchingRegex = /(users\/).*/;
  const oauthPathMatchingRegex = /(#access_token).*/;

  // Replace any ids with * and keep the rest of the URL intact
  let transformedUrl = url.replace(idMatchingRegex, `/*`);

  // Replace the region and bucket names with * and keep the rest of the URL intact.
  // Object storage file navigation is truncated via the 'clear search' transform.
  transformedUrl = transformedUrl.replace(
    bucketPathMatchingRegex,
    'buckets/*/*'
  );

  // Remove everything after access_token
  transformedUrl = transformedUrl.replace(oauthPathMatchingRegex, '$1');

  // Remove everything after /users
  transformedUrl = transformedUrl.replace(userPathMatchingRegex, '$1');
  return transformedUrl;
};

/**
 * Initializes our Pendo analytics script on mount if a valid `PENDO_API_KEY` exists and OneTrust consent is present.
 */
export const usePendo = () => {
  const { data: account } = useAccount();
  const { data: profile } = useProfile();

  const accountId = getUniquePendoId(account?.euuid);
  const visitorId = getUniquePendoId(profile?.uid.toString());

  const optanonCookie = getCookie('OptanonConsent');
  // Since OptanonConsent cookie always has a .linode.com domain, only check for consent in dev/staging/prod envs.
  // When running the app locally, do not try to check for OneTrust cookie consent, just enable Pendo.
  const hasConsentEnabled =
    appRoot.includes('localhost') ||
    checkOptanonConsent(
      optanonCookie,
      ONE_TRUST_COOKIE_CATEGORIES['Performance Cookies']
    );

  // Retrieve our self-hosted Pendo agent script (M3-9347).
  const PENDO_SCRIPT =
    appRoot === 'https://cloud.linode.com'
      ? '/pendo/pendo.js'
      : '/pendo/pendo-staging.js';

  React.useEffect(() => {
    if (PENDO_API_KEY && hasConsentEnabled) {
      // Adapted Pendo install script for readability
      // Refer to: https://support.pendo.io/hc/en-us/articles/21362607464987-Components-of-the-install-script#01H6S2EXET8C9FGSHP08XZAE4F

      // Set up Pendo namespace and queue
      const pendo = (window['pendo'] = window['pendo'] || {});
      pendo._q = pendo._q || [];

      // Define the methods Pendo uses in a queue
      const methodNames = [
        'initialize',
        'identify',
        'updateOptions',
        'pageLoad',
        'track',
      ];

      // Enqueue methods and their arguments on the Pendo object
      methodNames.forEach((_, index) => {
        (function (method) {
          pendo[method] =
            pendo[method] ||
            function () {
              pendo._q[method === methodNames[0] ? 'unshift' : 'push'](
                // eslint-disable-next-line prefer-rest-params
                [method].concat([].slice.call(arguments, 0))
              );
            };
        })(methodNames[index]);
      });

      // Load Pendo script into the head HTML tag, then initialize Pendo with metadata
      loadScript(PENDO_SCRIPT, {
        location: 'head',
      }).then(() => {
        try {
          window.pendo.initialize({
            account: {
              id: accountId, // Highly recommended, required if using Pendo Feedback
              // name:         // Optional
              // is_paying:    // Recommended if using Pendo Feedback
              // monthly_value:// Recommended if using Pendo Feedback
              // planLevel:    // Optional
              // planPrice:    // Optional
              // creationDate: // Optional

              // You can add any additional account level key-values here,
              // as long as it's not one of the above reserved names.
            },
            // Controls what URLs we send to Pendo. Refer to: https://agent.pendo.io/advanced/location/.
            location: {
              transforms: [
                {
                  action: 'Clear',
                  attr: 'hash',
                },
                {
                  action: 'Clear',
                  attr: 'search',
                },
                {
                  action: 'Replace',
                  attr: 'pathname',
                  data(url: string) {
                    return transformUrl(url);
                  },
                },
              ],
            },
            visitor: {
              id: visitorId, // Required if user is logged in
              // email:        // Recommended if using Pendo Feedback, or NPS Email
              // full_name:    // Recommended if using Pendo Feedback
              // role:         // Optional

              // You can add any additional visitor level key-values here,
              // as long as it's not one of the above reserved names.
            },
          });
        } catch (error) {
          reportException(
            'An error occurred when trying to initialize Pendo.',
            { error }
          );
        }
      });
    }
  }, [PENDO_SCRIPT, accountId, hasConsentEnabled, visitorId]);
};
