import { yupResolver } from '@hookform/resolvers/yup';
import { CreateLinodeSchema } from '@linode/validation';
import { useHistory } from 'react-router-dom';

import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { utoa } from '../LinodesCreate/utilities';

import type { LinodeCreateType } from '../LinodesCreate/types';
import type { CreateLinodeRequest, InterfacePayload } from '@linode/api-v4';
import type { Resolver } from 'react-hook-form';

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
  const values = { ...payload };
  if (values.metadata?.user_data) {
    values.metadata.user_data = utoa(values.metadata.user_data);
  }

  if (!values.metadata?.user_data) {
    values.metadata = undefined;
  }

  values.interfaces = getInterfacesPayload(
    values.interfaces,
    Boolean(values.private_ip)
  );

  return values;
};

/**
 * Transforms and orders the Linode Create "interfaces" form data.
 *
 * We need this so we can put interfaces in the correct order and omit unused interfaces.
 *
 * @param interfaces raw interfaces from the Linode create flow form
 * @returns a transformed interfaces array in the correct order and with the expected values for the API
 */
export const getInterfacesPayload = (
  interfaces: InterfacePayload[] | undefined,
  hasPrivateIP: boolean | undefined
): InterfacePayload[] | undefined => {
  if (!interfaces) {
    return undefined;
  }

  const vpcInterface = interfaces[0];
  const vlanInterface = interfaces[1];
  const publicInterface = interfaces[2];

  const hasVPC = Boolean(vpcInterface.vpc_id);
  const hasVLAN = Boolean(vlanInterface.label);

  if (hasVPC && hasVLAN && hasPrivateIP) {
    return [vpcInterface, vlanInterface, publicInterface];
  }

  if (hasVLAN && hasVPC) {
    return [vpcInterface, vlanInterface];
  }

  if (hasVPC && hasPrivateIP) {
    return [vpcInterface, publicInterface];
  }

  if (hasVLAN) {
    return [publicInterface, vlanInterface];
  }

  if (hasVPC) {
    return [vpcInterface];
  }

  // If no special case is met, don't send `interfaces` in the Linode
  // create payload. This will cause the API to default to giving the Linode
  // public communication.
  return undefined;
};

export const defaultValues: CreateLinodeRequest = {
  image: 'linode/debian11',
  interfaces: [
    {
      ipam_address: '',
      label: '',
      purpose: 'vpc',
    },
    {
      ipam_address: '',
      label: '',
      purpose: 'vlan',
    },
    {
      ipam_address: '',
      label: '',
      purpose: 'public',
    },
  ],
  region: '',
  type: '',
};

/**
 * Provides dynamic validation to the Linode Create form.
 *
 * Unfortunately, we have to wrap `yupResolver` so that we can transform the payload
 * using `getLinodeCreatePayload` before validation happens.
 */
export const resolver: Resolver<CreateLinodeRequest> = async (
  values,
  context,
  options
) => {
  const transformedValues = getLinodeCreatePayload(values);

  const { errors } = await yupResolver(
    CreateLinodeSchema,
    {},
    { rawValues: true }
  )(transformedValues, context, options);

  if (errors) {
    return { errors, values };
  }

  return { errors: {}, values };
};
