import { getLinode, getStackScript } from '@linode/api-v4';
import { omit } from 'lodash';
import { useHistory } from 'react-router-dom';

import { imageQueries } from 'src/queries/images';
import { stackscriptQueries } from 'src/queries/stackscripts';
import { sendCreateLinodeEvent } from 'src/utilities/analytics/customEventAnalytics';
import { privateIPRegex } from 'src/utilities/ipUtils';
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
import type { QueryClient } from '@tanstack/react-query';

/**
 * This is the ID of the Image of the default OS.
 */
const DEFAULT_OS = 'linode/debian11';

/**
 * This interface is used to type the query params on the Linode Create flow.
 */
interface LinodeCreateQueryParams {
  appID: string | undefined;
  backupID: string | undefined;
  imageID: string | undefined;
  linodeID: string | undefined;
  stackScriptID: string | undefined;
  subtype: StackScriptTabType | undefined;
  type: LinodeCreateType | undefined;
}

interface ParsedLinodeCreateQueryParams {
  appID: number | undefined;
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
    appID: rawParams.appID ? Number(rawParams.appID) : undefined,
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
  'OS',
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

export const defaultInterfaces: InterfacePayload[] = [
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
];

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
export const defaultValues = async (
  queryClient: QueryClient
): Promise<LinodeCreateFormValues> => {
  const queryParams = getQueryParamsFromQueryString(window.location.search);
  const params = getParsedLinodeCreateQueryParams(queryParams);

  const stackscriptId = params.stackScriptID ?? params.appID;

  const stackscript = stackscriptId
    ? await getStackScript(stackscriptId)
    : null;

  const linode = params.linodeID ? await getLinode(params.linodeID) : null;

  const privateIp =
    linode?.ipv4.some((ipv4) => privateIPRegex.test(ipv4)) ?? false;

  const values: LinodeCreateFormValues = {
    backup_id: params.backupID,
    image: getDefaultImageId(params),
    interfaces: defaultInterfaces,
    linode,
    private_ip: privateIp,
    region: linode ? linode.region : '',
    stackscript_data: stackscript?.user_defined_fields
      ? getDefaultUDFData(stackscript.user_defined_fields)
      : undefined,
    stackscript_id: stackscriptId,
    type: linode?.type ? linode.type : '',
  };

  values.label = await getGeneratedLinodeLabel({
    queryClient,
    tab: params.type,
    values,
  });

  return values;
};

const getDefaultImageId = (params: ParsedLinodeCreateQueryParams) => {
  // You can't have an Image selected when deploying from a backup.
  if (params.type === 'Backups') {
    return null;
  }

  // Always default debian for the OS tab.
  if (!params.type || params.type === 'OS') {
    return DEFAULT_OS;
  }

  // If the user is deep linked to the Images tab with a preselected image,
  // default to it.
  if (params.type === 'Images' && params.imageID) {
    return params.imageID;
  }

  return null;
};

interface GeneratedLinodeLabelOptions {
  queryClient: QueryClient;
  tab: LinodeCreateType | undefined;
  values: LinodeCreateFormValues;
}

export const getGeneratedLinodeLabel = async (
  options: GeneratedLinodeLabelOptions
) => {
  const { queryClient, tab, values } = options;

  if (tab === 'OS') {
    const generatedLabelParts: string[] = [];
    if (values.image) {
      const image = await queryClient.ensureQueryData(
        imageQueries.image(values.image)
      );
      if (image.vendor) {
        generatedLabelParts.push(image.vendor.toLowerCase());
      }
    }
    if (values.region) {
      generatedLabelParts.push(values.region);
    }
    return getLinodeLabelFromLabelParts(generatedLabelParts);
  }

  if (tab === 'Images') {
    const generatedLabelParts: string[] = [];
    if (values.image) {
      const image = await queryClient.ensureQueryData(
        imageQueries.image(values.image)
      );
      generatedLabelParts.push(image.label);
    }
    if (values.region) {
      generatedLabelParts.push(values.region);
    }
    return getLinodeLabelFromLabelParts(generatedLabelParts);
  }

  if (tab === 'StackScripts' || tab === 'One-Click') {
    const generatedLabelParts: string[] = [];
    if (values.stackscript_id) {
      const stackscript = await queryClient.ensureQueryData(
        stackscriptQueries.stackscript(values.stackscript_id)
      );
      generatedLabelParts.push(stackscript.label.toLowerCase());
    }
    if (values.region) {
      generatedLabelParts.push(values.region);
    }
    return getLinodeLabelFromLabelParts(generatedLabelParts);
  }

  if (tab === 'Backups') {
    const generatedLabelParts: string[] = [];
    if (values.linode) {
      generatedLabelParts.push(values.linode.label);
    }
    generatedLabelParts.push('backup');
    return getLinodeLabelFromLabelParts(generatedLabelParts);
  }

  if (tab === 'Clone Linode') {
    const generatedLabelParts: string[] = [];
    if (values.linode) {
      generatedLabelParts.push(values.linode.label);
    }
    generatedLabelParts.push('clone');
    return getLinodeLabelFromLabelParts(generatedLabelParts);
  }

  return '';
};

export const getIsValidLinodeLabelCharacter = (char: string) => {
  return /^[0-9a-zA-Z]$/.test(char);
};

/**
 * Given an array of strings, this function joins them together by
 * "-" and ensures that the generated label is <= 64 characters.
 *
 * @param parts an array of strings that will be joined together by a "-"
 * @returns a generated Linode label that is <= 64 characters
 */
export const getLinodeLabelFromLabelParts = (parts: string[]) => {
  const numberOfSeperaterDashes = parts.length - 1;
  const maxSizeOfEachPart = Math.floor(
    (64 - numberOfSeperaterDashes) / parts.length
  );
  let label = '';

  for (const part of parts) {
    for (let i = 0; i < Math.min(part.length, maxSizeOfEachPart); i++) {
      if (
        getIsValidLinodeLabelCharacter(part[i]) ||
        (part[i] === '-' && label[label.length - 1] !== '-') ||
        (part[i] === '.' && label[label.length - 1] !== '.') ||
        (part[i] === '_' && label[label.length - 1] !== '_')
      ) {
        label += part[i];
      } else if (part[i] === ' ' && label[label.length - 1] !== '-') {
        label += '-';
      }
    }
    if (part !== parts[parts.length - 1]) {
      label += '-';
    }
  }

  return label;
};

interface LinodeCreateAnalyticsEventOptions {
  queryClient: QueryClient;
  type: LinodeCreateType;
  values: LinodeCreateFormValues;
}

/**
 * Captures a custom analytics event when a Linode is created.
 */
export const captureLinodeCreateAnalyticsEvent = async (
  options: LinodeCreateAnalyticsEventOptions
) => {
  const { queryClient, type, values } = options;

  if (type === 'Backups' && values.backup_id) {
    sendCreateLinodeEvent('backup', String(values.backup_id));
  }

  if (type === 'Clone Linode' && values.linode) {
    const linodeId = values.linode.id;
    // @todo use Linode query key factory when it is implemented
    const linode = await queryClient.ensureQueryData({
      queryFn: () => getLinode(linodeId),
      queryKey: ['linodes', 'linode', linodeId, 'details'],
    });

    sendCreateLinodeEvent('clone', values.type, {
      isLinodePoweredOff: linode.status === 'offline',
    });
  }

  if (type === 'OS' || type === 'Images') {
    sendCreateLinodeEvent('image', values.image ?? undefined);
  }

  if (type === 'StackScripts' && values.stackscript_id) {
    const stackscript = await queryClient.ensureQueryData(
      stackscriptQueries.stackscript(values.stackscript_id)
    );
    sendCreateLinodeEvent('stackscript', stackscript.label);
  }

  if (type === 'One-Click' && values.stackscript_id) {
    const stackscript = await queryClient.ensureQueryData(
      stackscriptQueries.stackscript(values.stackscript_id)
    );
    sendCreateLinodeEvent('one-click', stackscript.label);
  }
};
