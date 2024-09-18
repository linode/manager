import { sha256 } from 'js-sha256';
import React from 'react';

import { /* APP_ROOT,*/ PENDO_API_KEY } from 'src/constants';
import { useAccount } from 'src/queries/account/account.js';
import { useProfile } from 'src/queries/profile/profile';

import { loadScript } from './useScript';

declare global {
  interface Window {
    pendo: any;
  }
}

/**
 * Initializes our Pendo analytics script on mount.
 */
export const usePendo = () => {
  const { data: profile } = useProfile();
  const { data: account } = useAccount();

  const visitorId = sha256(profile?.uid.toString() ?? '');
  const accountId = sha256(account?.euuid ?? '');

  // const STAGING_URL = '';
  const PROD_URL = `https://cdn.pendo.io/agent/static/${PENDO_API_KEY}/pendo.js`;
  // const PENDO_CDN_URL =
  //   APP_ROOT !== 'https://cloud.linode.com' ? STAGING_URL : PROD_URL;

  React.useEffect(() => {
    // Adapted the Pendo install script:

    // Set up Pendo namespace
    const pendo = (window['pendo'] = window['pendo'] || {});

    // Define the methods Pendo uses in a queue
    const methodNames = [
      'initialize',
      'identify',
      'updateOptions',
      'pageLoad',
      'track',
    ];
    let index, x;
    pendo._q = pendo._q || [];
    for (index = 0, x = methodNames.length; index < x; ++index) {
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
    }

    // Load Pendo script into the head HTML tag, then initialize Pendo with metadata
    loadScript(PROD_URL, {
      location: 'head',
    }).then(() => {
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

        visitor: {
          id: visitorId, // Required if user is logged in
          // email:        // Recommended if using Pendo Feedback, or NPS Email
          // full_name:    // Recommended if using Pendo Feedback
          // role:         // Optional

          // You can add any additional visitor level key-values here,
          // as long as it's not one of the above reserved names.
        },
      });
    });
  }, []);
};
