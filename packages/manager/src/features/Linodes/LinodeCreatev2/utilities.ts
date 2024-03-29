import { CreateLinodeRequest, InterfacePurpose } from '@linode/api-v4';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import type { LinodeCreateType } from '../LinodesCreate/types';

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

export const useInterfaces = (purpose: InterfacePurpose) => {
  const {
    append,
    fields: interfaces,
    insert,
    move,
    prepend,
    remove,
    swap,
    update,
  } = useFieldArray<CreateLinodeRequest, 'interfaces'>({
    name: 'interfaces',
  });

  const interfaceIndex =
    interfaces?.findIndex((i) => i.purpose === purpose) ?? -1;

  const index = interfaceIndex === -1 ? 0 : interfaceIndex;

  const interfaceItem =
    interfaceIndex !== -1 ? interfaces?.[interfaceIndex] : null;

  const existsInPayload = interfaceIndex !== -1;

  return {
    append,
    existsInPayload,
    index,
    insert,
    interfaceItem,
    interfaces,
    remove,
    swap,
    update,
  };
};
