import * as React from 'react';
import { AllData, getValues, LongviewFieldName } from '../../../request';

export const useGraphs = (
  requestFields: LongviewFieldName[],
  clientAPIKey: string,
  start: number,
  end: number
) => {
  const [data, setData] = React.useState<Partial<AllData>>({});
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const request = () => {
    if (!start || !end) {
      return;
    }
    setLoading(true);
    return getValues(clientAPIKey, {
      fields: requestFields,
      start,
      end
    })
      .then(response => {
        setLoading(false);
        setError(undefined);
        setData(response);
      })
      .catch(_ => {
        setLoading(false);
        setError('Unable to retrieve CPU data.');
      });
  };

  return { error, data, loading, request };
};
