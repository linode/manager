import { useHistory } from 'react-router-dom';

import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import type { LinodeCreateType } from '../LinodesCreate/types';

interface LinodeCreateQueryParams {
  type: LinodeCreateType | undefined;
}

export const useLinodeCreateQueryParams = () => {
  const history = useHistory();

  const rawParams = getQueryParamsFromQueryString(history.location.search);

  const updateParams = (params: Partial<LinodeCreateQueryParams>) => {
    const newParams = new URLSearchParams({ ...rawParams, ...params });
    history.replace({ search: newParams.toString() });
  };

  const params = {
    type: rawParams.type as LinodeCreateType | undefined,
  } as LinodeCreateQueryParams;

  return { params, updateParams };
};

export const getTabIndex = (tabType: LinodeCreateType | undefined) => {
  if (!tabType) {
    return 0;
  }

  const currentTabIndex = tabs.indexOf(tabType);

  if (currentTabIndex === -1) {
    return 0;
  }

  return currentTabIndex;
};

export const tabs: LinodeCreateType[] = [
  'Distributions',
  'One-Click',
  'StackScripts',
  'Images',
  'Backups',
  'Clone Linode',
];
