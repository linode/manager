import { useEffect } from 'react';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { reportException } from 'src/exceptionReporting';
import { useAccount } from 'src/queries/account/account.js';
import { useProfile } from 'src/queries/profile/profile';

import pendo from '../assets/pendo/pendo.js';
import { loadScript } from './useScript';

declare global {
  interface Window {
    pendo: any;
  }
}

/**
 * Initializes our Adobe Analytics script on mount and subscribes to page view events.
 */
export const usePendo = () => {
  const history = useHistory();
  const { data: profile } = useProfile();
  const { data: account } = useAccount();

  console.log('usePendo');
  React.useEffect(() => {
    loadScript(pendo, { location: 'head' }).then(() => {
      // This function creates visitors and accounts in Pendo
      // You will need to replace <visitor-id-goes-here> and <account-id-goes-here> with values you use in your app
      // Please use Strings, Numbers, or Bools for value types.
      window.pendo.initialize({
        account: {
          id: `test-account-dev`, // Highly recommended, required if using Pendo Feedback
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
          id: `test-visitor-dev`, // Required if user is logged in
          // email:        // Recommended if using Pendo Feedback, or NPS Email
          // full_name:    // Recommended if using Pendo Feedback
          // role:         // Optional

          // You can add any additional visitor level key-values here,
          // as long as it's not one of the above reserved names.
        },
      });
    });

    //   const script = document.createElement('script');
    //   // eslint-disable-next-line scanjs-rules/assign_to_src
    //   script.src = pendo;
    //   script.type = 'text/javascript';
    //   script.async = true;
    //   script.defer = true

    //   console.log(script.src);
    //   // Add script to document; default to body
    //   if (script){
    //     document.head.appendChild(script);
    //   }
  }, []);

  React.useEffect(() => {
    /**
     * Send pageviews
     */
    return history.listen(({ pathname }) => {});
  }, [history]);

  return null;
};
