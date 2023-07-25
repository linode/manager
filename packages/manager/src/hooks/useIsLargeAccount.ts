import { LARGE_ACCOUNT_THRESHOLD } from 'src/constants';
import { useLinodesQuery } from 'src/queries/linodes/linodes';

export const useIsLargeAccount = (enabled = true) => {
  const { data: linodesData } = useLinodesQuery({}, {}, enabled);

  if (!linodesData) {
    return undefined;
  }

  return linodesData.results > LARGE_ACCOUNT_THRESHOLD;
};
