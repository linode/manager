import {
  accountQueries,
  firewallQueries,
  imageQueries,
  linodeQueries,
  stackscriptQueries,
} from '@linode/queries';
import { omitProps } from '@linode/ui';
import {
  getQueryParamsFromQueryString,
  isNotNullOrUndefined,
  utoa,
} from '@linode/utilities';
import { enqueueSnackbar } from 'notistack';
import { useCallback } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { sendCreateLinodeEvent } from 'src/utilities/analytics/customEventAnalytics';
import { sendLinodeCreateFormErrorEvent } from 'src/utilities/analytics/formEventAnalytics';
import { isPrivateIP } from 'src/utilities/ipUtils';

import {
  getDefaultInterfacePayload,
  getLegacyInterfaceFromLinodeInterface,
  getLinodeInterfacePayload,
} from './Networking/utilities';
import { getDefaultUDFData } from './Tabs/StackScripts/UserDefinedFields/utilities';

import type { LinodeCreateInterface } from './Networking/utilities';
import type { StackScriptTabType } from './Tabs/StackScripts/utilities';
import type {
  AccountSettings,
  CreateLinodeRequest,
  FirewallSettings,
  InterfaceGenerationType,
  InterfacePayload,
  Linode,
  Profile,
  StackScript,
} from '@linode/api-v4';
import type { LinodeCreateType } from '@linode/utilities';
import type { QueryClient } from '@tanstack/react-query';

/**
 * This is the ID of the Image of the default OS.
 */
const DEFAULT_OS = 'linode/ubuntu24.04';

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
      if (!params[key as keyof LinodeCreateQueryParams]) {
        newParams.delete(key);
      } else {
        newParams.set(key, params[key as keyof LinodeCreateQueryParams]!);
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
 * @param formValues the initial raw values from the Linode Create form
 * @returns final Linode Create payload to be sent to the API
 */
export const getLinodeCreatePayload = (
  formValues: LinodeCreateFormValues,
  isShowingNewNetworkingUI: boolean
): CreateLinodeRequest => {
  const values: CreateLinodeRequest = omitProps(formValues, [
    'linode',
    'hasSignedEUAgreement',
    'firewallOverride',
    'linodeInterfaces',
  ]);

  if (values.metadata?.user_data) {
    values.metadata.user_data = utoa(values.metadata.user_data);
  }

  if (!values.metadata?.user_data) {
    values.metadata = undefined;
  }

  if (!values.placement_group?.id) {
    values.placement_group = undefined;
  }

  if (isShowingNewNetworkingUI) {
    const shouldUseNewInterfaces = values.interface_generation === 'linode';

    if (shouldUseNewInterfaces) {
      values.interfaces = formValues.linodeInterfaces.map(
        getLinodeInterfacePayload
      );
      values.firewall_id = undefined;
    } else {
      values.interfaces = formValues.linodeInterfaces.map(
        getLegacyInterfaceFromLinodeInterface
      );
    }
  } else {
    values.interfaces = getInterfacesPayload(
      formValues.interfaces,
      Boolean(values.private_ip)
    );
  }

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
  hasPrivateIP: LinodeCreateFormValues['backups_enabled']
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

const defaultInterfaces: InterfacePayload[] = [
  {
    ipam_address: '',
    label: '',
    primary: true,
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
   * Manually override firewall policy for sensitive users
   */
  firewallOverride?: boolean;
  /**
   * Whether or not the user has signed the EU agreement
   */
  hasSignedEUAgreement?: boolean;
  /**
   * Override the interfaces type of the Linode Create flow so it only has Legacy Interfaces.
   * `ipv4` and `ipv6` fields are only accepted for VPC interfaces and the omit type avoids
   * `CreateLinodeSchema` type errors (see https://github.com/linode/manager/pull/11942#discussion_r2043029481)
   */
  interfaces: InterfacePayload[] | Omit<InterfacePayload, 'ipv4' | 'ipv6'>[];
  /**
   * The currently selected Linode (used for the Backups and Clone tabs)
   */
  linode?: null | {
    id: number;
    label: string;
    region: string;
    type: null | string;
  };
  /**
   * Form state for the new Linode interface
   */
  linodeInterfaces: LinodeCreateInterface[];
}

export interface LinodeCreateFormContext {
  /**
   * Is the form using the new Interfaces UI?
   */
  isLinodeInterfacesEnabled: boolean;
  /**
   * Profile data is used in the Linode Create resolver because
   * restricted users are subject to different validation.
   */
  profile: Profile | undefined;
  /**
   * Used for dispaying warnings to internal Akamai employees.
   */
  secureVMNoticesEnabled: boolean;
}

/**
 * This function initializes the Linode Create flow form
 * when the form mounts.
 *
 * The default values are dependent on the query params present.
 */
export const defaultValues = async (
  params: ParsedLinodeCreateQueryParams,
  queryClient: QueryClient,
  isLinodeInterfacesEnabled: boolean
): Promise<LinodeCreateFormValues> => {
  const stackscriptId = params.stackScriptID ?? params.appID;

  let stackscript: null | StackScript = null;

  if (stackscriptId) {
    try {
      stackscript = await queryClient.ensureQueryData(
        stackscriptQueries.stackscript(stackscriptId)
      );
    } catch (error) {
      enqueueSnackbar('Unable to initialize StackScript user defined field.', {
        variant: 'error',
      });
    }
  }

  let linode: Linode | null = null;

  if (params.linodeID) {
    try {
      linode = await queryClient.ensureQueryData(
        linodeQueries.linode(params.linodeID)
      );
    } catch (error) {
      enqueueSnackbar('Unable to initialize pre-selected Linode.', {
        variant: 'error',
      });
    }
  }

  let interfaceGeneration: LinodeCreateFormValues['interface_generation'] =
    undefined;

  if (isLinodeInterfacesEnabled) {
    const linodeId = params.linodeID;
    try {
      let linode: Linode | undefined;
      if (linodeId) {
        linode = await queryClient.ensureQueryData(
          linodeQueries.linode(linodeId)
        );
      }
      const accountSettings = await queryClient.ensureQueryData(
        accountQueries.settings
      );
      interfaceGeneration =
        linode?.interface_generation ??
        getDefaultInterfaceGenerationFromAccountSetting(
          accountSettings.interfaces_for_new_linodes
        );
    } catch (error) {
      // silently fail because the user may be a restricted user that can't access this endpoint
    }
  }

  let firewallSettings: FirewallSettings | null = null;

  if (isLinodeInterfacesEnabled) {
    try {
      firewallSettings = await queryClient.ensureQueryData(
        firewallQueries.settings
      );
    } catch {
      // We can silently fail. Worst case, a user's default firewall won't be pre-populated.
    }
  }

  const privateIp =
    interfaceGeneration !== 'linode' &&
    (linode?.ipv4.some(isPrivateIP) ?? false);

  const values: LinodeCreateFormValues = {
    backup_id: params.backupID,
    backups_enabled: linode?.backups.enabled,
    firewall_id:
      firewallSettings && firewallSettings.default_firewall_ids.linode
        ? firewallSettings.default_firewall_ids.linode
        : undefined,
    image: getDefaultImageId(params),
    interface_generation: interfaceGeneration,
    interfaces: defaultInterfaces,
    linode,
    linodeInterfaces: [getDefaultInterfacePayload('public', firewallSettings)],
    private_ip: privateIp,
    region: linode ? linode.region : '',
    stackscript_data: stackscript?.user_defined_fields
      ? getDefaultUDFData(stackscript.user_defined_fields)
      : undefined,
    stackscript_id: stackscriptId,
    type: linode?.type ? linode.type : '',
  };

  try {
    values.label = await getGeneratedLinodeLabel({
      queryClient,
      tab: params.type,
      values,
    });
  } catch (error) {
    enqueueSnackbar('Unable to generate a Linode label.', { variant: 'error' });
  }

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
  secureVMNoticesEnabled: boolean;
  type: LinodeCreateType;
  values: LinodeCreateFormValues;
}

/**
 * Captures a custom analytics event when a Linode is created.
 */
export const captureLinodeCreateAnalyticsEvent = async (
  options: LinodeCreateAnalyticsEventOptions
) => {
  const { queryClient, secureVMNoticesEnabled, type, values } = options;

  const secureVMCompliant = secureVMNoticesEnabled
    ? isNotNullOrUndefined(values.firewall_id)
    : undefined;

  if (type === 'Backups' && values.backup_id) {
    sendCreateLinodeEvent('backup', String(values.backup_id), {
      secureVMCompliant,
    });
  }

  if (type === 'Clone Linode' && values.linode) {
    const linodeId = values.linode.id;

    const linode = await queryClient.ensureQueryData(
      linodeQueries.linode(linodeId)
    );

    sendCreateLinodeEvent('clone', values.type, {
      isLinodePoweredOff: linode.status === 'offline',
      secureVMCompliant,
    });
  }

  if (type === 'OS' || type === 'Images') {
    sendCreateLinodeEvent('image', values.image ?? undefined, {
      secureVMCompliant,
    });
  }

  if (type === 'StackScripts' && values.stackscript_id) {
    const stackscript = await queryClient.ensureQueryData(
      stackscriptQueries.stackscript(values.stackscript_id)
    );
    sendCreateLinodeEvent('stackscript', stackscript.label, {
      secureVMCompliant,
    });
  }

  if (type === 'One-Click' && values.stackscript_id) {
    const stackscript = await queryClient.ensureQueryData(
      stackscriptQueries.stackscript(values.stackscript_id)
    );
    sendCreateLinodeEvent('one-click', stackscript.label, {
      secureVMCompliant,
    });
  }
};

/**
 * Custom hook to send a Adobe Analytics form error event with error messages in the Linode Create flow.
 */
export const useHandleLinodeCreateAnalyticsFormError = (
  createType: LinodeCreateType
) => {
  const handleLinodeCreateAnalyticsFormError = useCallback(
    (errors: FieldErrors<LinodeCreateFormValues>) => {
      let errorString = '';

      if (!errors) {
        return;
      }

      if (errors.region) {
        errorString += errors.region.message;
      }
      if (errors.type) {
        errorString += `${errorString.length > 0 ? `|` : ''}${
          errors.type.message
        }`;
      }
      if (errors.root_pass) {
        errorString += `${errorString.length > 0 ? `|` : ''}${
          errors.root_pass.message
        }`;
      }
      if (errors.root) {
        errorString += `${errorString.length > 0 ? `|` : ''}${
          errors.root.message
        }`;
      }

      sendLinodeCreateFormErrorEvent(errorString, createType);
    },
    [createType]
  );

  return { handleLinodeCreateAnalyticsFormError };
};

export const getDefaultInterfaceGenerationFromAccountSetting = (
  accountSetting: AccountSettings['interfaces_for_new_linodes']
): InterfaceGenerationType | undefined => {
  if (
    accountSetting === 'linode_only' ||
    accountSetting === 'linode_default_but_legacy_config_allowed'
  ) {
    return 'linode';
  }
  if (
    accountSetting === 'legacy_config_only' ||
    accountSetting === 'legacy_config_default_but_linode_allowed'
  ) {
    return 'legacy_config';
  }
  return undefined;
};

/**
 * getDoesEmployeeNeedToAssignFirewall
 *
 * @returns
 * `true` if an internal Akamai employee should be creating their Linode
 * with a Firewall given the current network Configuration.
 *
 * `false` if the user has satisified the Firewall requirment or
 * their network configuration does not require a Firewall.
 */
export const getDoesEmployeeNeedToAssignFirewall = (
  legacyFirewallId: LinodeCreateFormValues['firewall_id'],
  linodeInterfaces: LinodeCreateFormValues['linodeInterfaces'],
  interfaceGeneration: LinodeCreateFormValues['interface_generation']
) => {
  if (interfaceGeneration === 'linode') {
    // VLAN Linode interfaces do not support Firewalls, so we don't consider them.
    const interfacesThatMayHaveInternetConnectivity = linodeInterfaces.filter(
      (i) => i.purpose !== 'vlan'
    );

    return !interfacesThatMayHaveInternetConnectivity.every(
      (i) => i.firewall_id
    );
  }

  return !legacyFirewallId;
};
