import { useHistory } from 'react-router-dom';

import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { utoa } from '../LinodesCreate/utilities';

import type { LinodeCreateType } from '../LinodesCreate/types';
import type { CreateLinodeRequest, InterfacePayload } from '@linode/api-v4';

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

  if (!payload.metadata?.user_data) {
    payload.metadata = undefined;
  }

  payload.interfaces = getInterfacesPayload(payload.interfaces);

  return payload;
};

export const getInterfacesPayload = (
  interfaces: InterfacePayload[] | undefined
): InterfacePayload[] | undefined => {
  if (!interfaces) {
    return undefined;
  }

  interfaces = interfaces.filter((i) => {
    if (i.purpose === 'vpc' && !i.vpc_id) {
      // If no vpc was selected, clear remove it from the interfaces array
      return false;
    }
    if (i.purpose === 'vlan' && !i.label) {
      // If no VLAN label is specificed, remove it from the interfaces array
      return false;
    }
    return true;
  });

  if (interfaces.length === 1 && interfaces[0].purpose === 'public') {
    // If there is only 1 interface, and it is the public interface, return undefined.
    // The API will default to adding a public interface and this makes the payload cleaner.
    return undefined;
  }

  return interfaces;
};

export const defaultValues: CreateLinodeRequest = {
  image: 'linode/debian11',
  interfaces: [
    {
      ipam_address: '',
      label: '',
      purpose: 'public',
    },
    {
      ipam_address: '',
      label: '',
      purpose: 'vlan',
    },
    {
      ipam_address: '',
      label: '',
      purpose: 'vpc',
    },
  ],
  region: '',
  type: '',
};
