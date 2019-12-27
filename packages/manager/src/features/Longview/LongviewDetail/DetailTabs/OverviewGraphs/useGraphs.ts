import { pathOr } from 'ramda';
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
  const request = () => {
    if (!mounted) {
      return;
    }
    if (!start || !end) {
      return;
    }
    setLoading(true);
    setData({});
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
          setError(
            pathOr('Unable to retrieve data.', ['NOTIFICATIONS', 0, 'TEXT'], e)
          );
        }
      });
  };

  // Request on first mount and when the clientAPIKey changes.
  React.useEffect(() => {
    if (!clientAPIKey) {
      return;
    }
    requestInterval = setInterval(() => {
      request();
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(requestInterval);
    };
  }, [clientAPIKey, start, end]);

  return { error, data, loading, request };
};
