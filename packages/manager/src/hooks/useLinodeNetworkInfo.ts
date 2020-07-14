import * as React from 'react';
import {
  Stats,
  getLinodeStatsByDate,
  getLinodeTransferByDate
} from '@linode/api-v4/lib/linodes';
import { NetworkTransfer } from '@linode/api-v4/lib/account';

export const useLinodeNetworkInfo = (
  linodeID: number,
  year: string,
  month: string
) => {
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  const [transferData, setTransferData] = React.useState<
    NetworkTransfer | undefined
  >();
  const [statsData, setStatsData] = React.useState<Stats | undefined>();

  React.useEffect(() => {
    setLoading(true);
    setErrorMessage(undefined);
    Promise.all([
      getLinodeStatsByDate(linodeID, year, month),
      getLinodeTransferByDate(linodeID, year, month)
    ])
      .then(([stats, transfer]) => {
        setLoading(false);
        setStatsData(stats);
        setTransferData(transfer);
      })
      .catch(_ => {
        setLoading(false);
        setErrorMessage(
          'There was an error retrieving network information for this Linode.'
        );
      });
  }, [linodeID, year, month]);

  return { loading, errorMessage, transfer: transferData, stats: statsData };
};
