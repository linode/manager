import { useHistory } from 'react-router-dom';

import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { utoa } from '../LinodesCreate/utilities';

import type { LinodeCreateType } from '../LinodesCreate/types';
import type { StackScriptTabType } from './Tabs/StackScripts/utilities';
import type { CreateLinodeRequest, InterfacePayload } from '@linode/api-v4';

/**
 * This interface is used to type the query params on the Linode Create flow.
 */
interface LinodeCreateQueryParams {
  stackScriptID: string | undefined;
  subtype: StackScriptTabType | undefined;
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
    const newParams = new URLSearchParams(rawParams);

    for (const key in params) {
      if (!params[key]) {
        newParams.delete(key);
      } else {
        newParams.set(key, params[key]);
      }
    }

    history.push({ search: newParams.toString() });
  };

  const params = {
    stackScriptID: rawParams.stackScriptID
      ? Number(rawParams.stackScriptID)
      : undefined,
    subtype: rawParams.subtype as StackScriptTabType | undefined,
    type: rawParams.type as LinodeCreateType | undefined,
  };

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

/**
 * Performans transformation and ordering on the Linode Create "interfaces" form data.
 *
 * We need this so we can put interfaces in the correct order and omit unused iterfaces.
 *
 * @param interfaces raw interfaces from the Linode create flow form
 * @returns a transformed interfaces array in the correct order and with the expected values for the API
 */
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

export const defaultValues = async (): Promise<CreateLinodeRequest> => {
  const queryParams = getQueryParamsFromQueryString(window.location.search);

  const stackScriptID = queryParams.stackScriptID
    ? Number(queryParams.stackScriptID)
    : undefined;

  return {
    image: stackScriptID ? undefined : 'linode/debian11',
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
    stackscript_id: stackScriptID,
    type: '',
  };
};
