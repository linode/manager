import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { getLastUpdated } from '../request';
import { LongviewNotification } from '../request.types';

export const useClientLastUpdated = (
  clientAPIKey?: string,
  callback?: (lastUpdated?: number) => void
) => {
  let mounted = true;
  let requestInterval: NodeJS.Timeout;

  /*
   lastUpdated _might_ come back from the endpoint as 0, so it's important
   that we differentiate between _0_ and _undefined_
   */
  const [lastUpdated, setLastUpdated] = useState<number | undefined>(undefined);
  const [notifications, setNotifications] = useState<LongviewNotification[]>(
    []
  );
  const currentLastUpdated = useRef(lastUpdated);
  const [lastUpdatedError, setLastUpdatedError] = useState<
    APIError[] | undefined
  >();
  const [authed, setAuthed] = useState<boolean>(true);

  const requestAndSetLastUpdated = (apiKey: string) => {
    /*
     get the current last updated value

     This function is called as a closure inside the onMount useEffect
     so we need to use a ref to get the new value
    */
    const { current: newLastUpdated } = currentLastUpdated;

    setLastUpdatedError(undefined);

    // Use a function argument for the API key instead `clientAPIKey` from the
    // lexical scope, since it is a dependency in the effect that will call
    // this function.
    return getLastUpdated(apiKey)
      .then(response => {
        /**
         * If there are any warnings in the response (found at response.NOTIFICATIONS)
         * we want to set them to state here so that consumers of this component
         * can handle them (usually by setting a banner). We choose to do this
         * here as these are high-level requests, made most frequently, and
         * notifications are not field-specific.
         */
        setNotifications(response.NOTIFICATIONS);
        /*
          only update _lastUpdated_ state if it hasn't already been set
          or the API response is in a time past what's already been set.
        */

        const _lastUpdated = response.DATA?.updated ?? 0;

        if (
          mounted &&
          (typeof newLastUpdated === 'undefined' ||
            _lastUpdated > newLastUpdated)
        ) {
          setLastUpdated(_lastUpdated);
          if (callback) {
            callback(_lastUpdated);
          }
        }
      })
      .catch(e => {
        /**
         * The first request we make after creating a new client will almost always
         * return an authentication failed error.
         */
        const reason = pathOr('', [0, 'TEXT'], e);

        if (mounted) {
          if (reason.match(/authentication/i)) {
            setAuthed(false);
          }

          /* only set lastUpdated error if we haven't already gotten data before */
          if (typeof newLastUpdated === 'undefined') {
            setLastUpdatedError(e);
          }
        }
      });
  };

  useEffect(() => {
    /*
     update the ref each time the lastUpdate state changes

     Why not just add lastUpdated as a dependency to the useEffect below?
     Because we don't want to re-instantiate the setInterval() over and over again
     but instead just do it once.

     The closure inside the useEffect below needs to know when lastUpdated changes
     but doesn't necessarily need to be re-defined again. useRef lets us accomplish this

     See: https://github.com/facebook/react/issues/14010#issuecomment-433788147

    */
    currentLastUpdated.current = lastUpdated;
  }, [lastUpdated]);

  // Request on first mount and when the clientAPIKey changes.
  useEffect(() => {
    if (!clientAPIKey) {
      return;
    }
    requestAndSetLastUpdated(clientAPIKey).then(() => {
      requestInterval = setInterval(() => {
        requestAndSetLastUpdated(clientAPIKey);
      }, 10000);
    });

    return () => {
      mounted = false;
      clearInterval(requestInterval);
    };
  }, [clientAPIKey]);

  return { lastUpdated, lastUpdatedError, authed, notifications };
};
