import {
  // getLinodeStats,
  Stats,
  getLinodeStatsByDate
} from '@linode/api-v4/lib/linodes';
import * as React from 'react';

export const useLinodeStats = (linodeID: number) => {
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [data, setData] = React.useState<Stats | undefined>();

  // @todo:
  //   - handle request type (by month)
  //   - add logic for refresh?

  React.useEffect(() => {
    setLoading(true);
    // @todo: real date selection logic.
    getLinodeStatsByDate(linodeID, '2020', '07')
      .then(data => {
        setLoading(false);
        setData(data);
      })
      .catch(_ => {
        setLoading(false);
        setErrorMessage('There was an error retrieving stats for this Linode.');
      });
  }, [linodeID]);

  return { loading, errorMessage, data };
};
