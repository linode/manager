import { LARGE_ACCOUNT_THRESHOLD } from 'src/constants';
import { useLinodesQuery } from 'src/queries/linodes/linodes';

export const useIsLargeAccount = () => {
  const { data: linodesData } = useLinodesQuery();
  return linodesData ? linodesData.results > LARGE_ACCOUNT_THRESHOLD : false;
};
