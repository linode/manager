import { yupResolver } from '@hookform/resolvers/yup';
import { getLinode, getStackScript } from '@linode/api-v4';
import { CreateLinodeSchema } from '@linode/validation';
import { omit } from 'lodash';
import { useHistory } from 'react-router-dom';

import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { utoa } from '../LinodesCreate/utilities';
import { getDefaultUDFData } from './Tabs/StackScripts/UserDefinedFields/utilities';

import type { LinodeCreateType } from '../LinodesCreate/types';
import type { StackScriptTabType } from './Tabs/StackScripts/utilities';
import type {
  CreateLinodeRequest,
  InterfacePayload,
  Linode,
} from '@linode/api-v4';
import type { Resolver } from 'react-hook-form';

/**
 * This is the ID of the Image of the default distribution.
 */
const DEFAULT_DISTRIBUTION = 'linode/debian11';

/**
 * This interface is used to type the query params on the Linode Create flow.
 */
interface LinodeCreateQueryParams {
  backupID: string | undefined;
  imageID: string | undefined;
  linodeID: string | undefined;
  stackScriptID: string | undefined;
  subtype: StackScriptTabType | undefined;
  type: LinodeCreateType | undefined;
}

interface ParsedLinodeCreateQueryParams {
  backupID: number | undefined;
  imageID: string | undefined;
  linodeID: number | undefined;
  stackScriptID: number | undefined;
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

  /**
   * Updates query params
   */
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

  /**
   * Replaces query params with the provided values
   */
  const setParams = (params: Partial<LinodeCreateQueryParams>) => {
    const newParams = new URLSearchParams(params);

    history.push({ search: newParams.toString() });
  };

  const params = getParsedLinodeCreateQueryParams(rawParams);

  return { params, setParams, updateParams };
};

const getParsedLinodeCreateQueryParams = (rawParams: {
  [key: string]: string;
}): ParsedLinodeCreateQueryParams => {
  return {
    backupID: rawParams.backupID ? Number(rawParams.backupID) : undefined,
    imageID: rawParams.imageID as string | undefined,
    linodeID: rawParams.linodeID ? Number(rawParams.linodeID) : undefined,
    stackScriptID: rawParams.stackScriptID
      ? Number(rawParams.stackScriptID)
      : undefined,
    subtype: rawParams.subtype as StackScriptTabType | undefined,
    type: rawParams.type as LinodeCreateType | undefined,
  };
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
  formValues: LinodeCreateFormValues
): CreateLinodeRequest => {
  const values = omit(formValues, ['linode']);
  if (values.metadata?.user_data) {
    values.metadata.user_data = utoa(values.metadata.user_data);
  }

  if (!values.metadata?.user_data) {
    values.metadata = undefined;
  }

  if (values.placement_group?.id === undefined) {
    values.placement_group = undefined;
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

const defaultVPCInterface = {
  ipam_address: '',
  label: '',
  purpose: 'vpc',
} as const;

const defaultVLANInterface = {
  ipam_address: '',
  label: '',
  purpose: 'vlan',
} as const;

const defaultPublicInterface = {
  ipam_address: '',
  label: '',
  purpose: 'public',
} as const;

/**
 * We extend the API's payload type so that we can hold some extra state
 * in the react-hook-form form.
 *
 * For example, we add `linode` so we can store the currently selected Linode
 * for the Backups and Clone tab.
 *
 * For any extra values added to the form, we should make sure `getLinodeCreatePayload`
 * removes them from the payload before it is sent to the API.
 */
export interface LinodeCreateFormValues extends CreateLinodeRequest {
  /**
   * The currently selected Linode
   */
  linode?: Linode | null;
}

/**
 * This function initializes the Linode Create flow form
 * when the form mounts.
 *
 * The default values are dependent on the query params present.
 */
export const defaultValues = async (): Promise<LinodeCreateFormValues> => {
  const queryParams = getQueryParamsFromQueryString(window.location.search);
  const params = getParsedLinodeCreateQueryParams(queryParams);

  const stackscript = params.stackScriptID
    ? await getStackScript(params.stackScriptID)
    : null;

  const linode = params.linodeID ? await getLinode(params.linodeID) : null;

  return {
    backup_id: params.backupID,
    image: getDefaultImageId(params),
    interfaces: [
      defaultVPCInterface,
      defaultVLANInterface,
      defaultPublicInterface,
    ],
    linode,
    region: linode ? linode.region : '',
    stackscript_data: stackscript?.user_defined_fields
      ? getDefaultUDFData(stackscript.user_defined_fields)
      : undefined,
    stackscript_id: params.stackScriptID,
    type: linode?.type ? linode.type : '',
  };
};

const getDefaultImageId = (params: ParsedLinodeCreateQueryParams) => {
  // You can't have an Image selected when deploying from a backup.
  if (params.type === 'Backups') {
    return null;
  }

  // Always default debian for the distributions tab.
  if (!params.type || params.type === 'Distributions') {
    return DEFAULT_DISTRIBUTION;
  }

  // If the user is deep linked to the Images tab with a preselected image,
  // default to it.
  if (params.type === 'Images' && params.imageID) {
    return params.imageID;
  }

  return null;
};

const defaultValuesForImages = {
  interfaces: [
    defaultVPCInterface,
    defaultVLANInterface,
    defaultPublicInterface,
  ],
  region: '',
  type: '',
};

const defaultValuesForDistributions = {
  image: DEFAULT_DISTRIBUTION,
  interfaces: [
    defaultVPCInterface,
    defaultVLANInterface,
    defaultPublicInterface,
  ],
  region: '',
  type: '',
};

const defaultValuesForStackScripts = {
  image: undefined,
  interfaces: [
    defaultVPCInterface,
    defaultVLANInterface,
    defaultPublicInterface,
  ],
  region: '',
  stackscript_id: null,
  type: '',
};

/**
 * A map that conatins default values for each Tab of the Linode Create flow.
 */
export const defaultValuesMap: Record<LinodeCreateType, CreateLinodeRequest> = {
  Backups: defaultValuesForImages,
  'Clone Linode': defaultValuesForImages,
  Distributions: defaultValuesForDistributions,
  Images: defaultValuesForImages,
  'One-Click': defaultValuesForImages,
  StackScripts: defaultValuesForStackScripts,
};

/**
 * Provides dynamic validation to the Linode Create form.
 *
 * Unfortunately, we have to wrap `yupResolver` so that we can transform the payload
 * using `getLinodeCreatePayload` before validation happens.
 */
export const resolver: Resolver<LinodeCreateFormValues> = async (
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
