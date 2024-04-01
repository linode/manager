import { useHistory } from 'react-router-dom';

import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import type { LinodeCreateType } from '../LinodesCreate/types';
import type { CreateLinodeRequest } from '@linode/api-v4';
import { utoa } from '../LinodesCreate/utilities';

/**
 * This interface is used to type the query params on the Linode Create flow.
 */
interface LinodeCreateQueryParams {
  type: LinodeCreateType | undefined;
}

/**
 * Hook that allows you to read and manage Linode Create flow query params.
 *
 * We have this because react-router-dom's query strings are not typesafe.
 */
export const useLinodeCreateQueryParams = () => {
  const history = useHistory();

  const rawParams = getQueryParamsFromQueryString(history.location.search);

  const updateParams = (params: Partial<LinodeCreateQueryParams>) => {
    const newParams = new URLSearchParams({ ...rawParams, ...params });
    history.push({ search: newParams.toString() });
  };

  const params = {
    type: rawParams.type as LinodeCreateType | undefined,
  } as LinodeCreateQueryParams;

  return { params, updateParams };
};

/**
 * Given the Linode Create flow 'type' from query params, this function
 * returns the tab's index. This allows us to control the tabs via the query string.
 */
export const getTabIndex = (tabType: LinodeCreateType | undefined) => {
  if (!tabType) {
    return 0;
  }

  const currentTabIndex = tabs.indexOf(tabType);

  // Users might type an invalid tab name into query params. Fallback to the first tab.
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

/**
 * Performs some transformations to the Linode Create form data so that the data
 * is in the correct format for the API. Intended to be used in the "onSubmit" when creating a Linode.
 *
 * @param payload the initial raw values from the Linode Create form
 * @returns final Linode Create payload to be sent to the API
 */
export const getLinodeCreatePayload = (
  payload: CreateLinodeRequest
): CreateLinodeRequest => {
  if (payload.metadata?.user_data) {
    payload.metadata.user_data = utoa(payload.metadata.user_data);
  }

  return payload;
};
