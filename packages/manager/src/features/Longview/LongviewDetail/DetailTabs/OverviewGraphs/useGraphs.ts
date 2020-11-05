import * as React from 'react';
import { getValues } from '../../../request';
import { AllData, LongviewFieldName } from '../../../request.types';

export const useGraphs = (
  requestFields: LongviewFieldName[],
  clientAPIKey: string | undefined,
  start: number,
  end: number
) => {
  const requestInterval = React.useRef<number>(0);
  const mounted = React.useRef(false);

  const [data, setData] = React.useState<Partial<AllData>>({});
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const request = React.useCallback(
    (isLoading: boolean = true) => {
      if (!mounted) {
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
        fields: requestFields,
        start,
        end
      })
        .then(response => {
          if (mounted.current) {
            setLoading(false);
            setError(undefined);
            setData(response.DATA);
          }
        })
        .catch(e => {
          if (mounted.current) {
            setLoading(false);
            setError(e.NOTIFICATIONS?.[0]?.TEXT ?? 'Unable to retrieve data.');
          }
        });
    },
    [start, end, clientAPIKey, requestFields]
  );

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
  }, [clientAPIKey, request]);

  return { error, data, loading, request };
};
