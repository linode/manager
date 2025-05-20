import * as React from 'react';

import { getValues } from '../../../request';

import type { AllData, LongviewFieldName } from '../../../request.types';

export const useGraphs = (
  requestFields: LongviewFieldName[],
  clientAPIKey: string | undefined,
  start: number,
  end: number
) => {
  const requestInterval = React.useRef<number>(0);
  const mounted = React.useRef(true);

  const [data, setData] = React.useState<Partial<AllData>>({});
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();

  const request = (isLoading: boolean = true) => {
    if (!mounted.current) {
      return;
    }
    if (!start || !end || !clientAPIKey) {
      return;
    }
    if (isLoading) {
      setLoading(true);
      setData({});
    }
    return getValues(clientAPIKey, {
      end,
      fields: requestFields,
      start,
    })
      .then((response) => {
        if (mounted.current) {
          setLoading(false);
          setError(undefined);
          setData(response.DATA);
        }
      })
      .catch((e) => {
        if (mounted.current) {
          setLoading(false);
          setError(e.NOTIFICATIONS?.[0]?.TEXT ?? 'Unable to retrieve data.');
        }
      });
  };

  // Poll the data. Reset/refresh the interval if the clientAPIKey changes.
  React.useEffect(() => {
    if (!clientAPIKey) {
      return;
    }
    requestInterval.current = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        request(false);
      }
    }, 10000);

    return () => {
      mounted.current = false;
      clearInterval(requestInterval.current);
    };
  }, [clientAPIKey]);

  return { data, error, loading, request };
};
