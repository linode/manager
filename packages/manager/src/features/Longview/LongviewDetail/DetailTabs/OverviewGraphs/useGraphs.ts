import * as React from 'react';
import { getValues } from '../../../request';
import { AllData, LongviewFieldName } from '../../../request.types';

export const useGraphs = (
  requestFields: LongviewFieldName[],
  clientAPIKey: string,
  start: number,
  end: number
) => {
  let mounted = true;
  let requestInterval: NodeJS.Timeout;

  const [data, setData] = React.useState<Partial<AllData>>({});
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const request = (isLoading: boolean = true) => {
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
        if (mounted) {
          setLoading(false);
          setError(undefined);
          setData(response.DATA);
        }
      })
      .catch(e => {
        if (mounted) {
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
    requestInterval = setInterval(() => {
      request(false);
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(requestInterval);
    };
  }, [clientAPIKey]);

  return { error, data, loading, request };
};
