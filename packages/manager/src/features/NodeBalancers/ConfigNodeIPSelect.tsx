import { Autocomplete, Select } from '@linode/ui';
import React, { useMemo } from 'react';

import { useGetLinodeIPAndVPCData } from 'src/hooks/useDataForLinodesInVPC';
import { useFlags } from 'src/hooks/useFlags';

import {
  getCustomIPOptions,
  getIPv6Options,
  getPrivateIPOptions,
  getVPCIPOptions,
  useIsCustomIPCustomer,
} from './ConfigNodeIPSelect.utils';
import { ConfigNodeOption } from './ConfigNodeOption';

import type { LinodeIPOption, VPCIPOption } from './ConfigNodeIPSelect.utils';
import type {
  NodeBalancerBackendConnectivity,
  NodeBalancerType,
} from '@linode/api-v4';

interface Props {
  /**
   * The backend connectivity of the NodeBalancer
   */
  backendConnectivity?: NodeBalancerBackendConnectivity;
  /**
   * Disables the select
   */
  disabled?: boolean;
  /**
   * Validation error text
   */
  errorText: string | undefined;
  /**
   * Function that is called when the select's value changes
   */
  handleChange: (
    nodeIndex: number,
    ipAddress: null | string,
    subnetId?: number
  ) => void;
  /**
   * Override the default input `id` for the select
   */
  inputId?: string;
  /**
   * The selected private IP address
   */
  nodeAddress: string | undefined;
  /**
   * The NodeBalancer type
   */
  nodeBalancerType?: NodeBalancerType;
  /**
   * The index of the config node in state
   */
  nodeIndex: number;
  /**
   * The region for which to load Linodes and to show private IPs
   * @note IPs won't load until a region is passed
   */
  region: string | undefined;

  /**
   * Function to set whether or not the notice about custom IPs should be shown
   */
  setShowCustomIPNotice: (show: boolean) => void;
  /**
   * The subnetID for which to load the available VPC IPs
   */
  subnetId?: number;

  /**
   * The vpcId for which to load available VPC IPs
   */
  vpcId?: number;
}
interface IPAddressSelectProps {
  disabled?: boolean;
  errorText: string | undefined;
  label: string;
  loading: boolean;
  noOptionsText: string;
}

export type NodeOption = LinodeIPOption | VPCIPOption;

export const ConfigNodeIPSelect = React.memo((props: Props) => {
  const {
    backendConnectivity,
    disabled,
    errorText,
    handleChange,
    inputId,
    nodeAddress,
    nodeBalancerType,
    nodeIndex,
    region,
    vpcId,
    setShowCustomIPNotice,
    subnetId,
  } = props;

  const { premiumNodebalancer: isPremiumNodebalancerEnabled } = useFlags();

  const { linodes, error, isLoading, vpc, vpcIPs } = useGetLinodeIPAndVPCData({
    region,
    vpcId,
  });

  const hasCustomIPCapability = useIsCustomIPCustomer();

  // When premium isn't enabled, connectivity is inferred from whether a VPC is selected.
  const inferredConnectivity = vpcId ? 'vpc' : 'legacy';
  const connectivity = isPremiumNodebalancerEnabled
    ? backendConnectivity
    : inferredConnectivity;

  const options = useMemo(() => {
    if (!region) {
      return [];
    }

    switch (connectivity) {
      case 'ipv6':
        return getIPv6Options(linodes);
      case 'legacy':
        return getPrivateIPOptions(linodes);
      case 'vpc':
        return vpcId && subnetId
          ? getVPCIPOptions(vpcIPs, linodes, vpc?.subnets)
          : [];
      default:
        return [];
    }
  }, [
    connectivity,
    isPremiumNodebalancerEnabled,
    linodes,
    region,
    subnetId,
    vpc,
    vpcId,
    vpcIPs,
  ]);

  const noOptionsText = useMemo(() => {
    if (!vpcId) {
      if (connectivity === 'ipv6') {
        return 'Please ensure you have at least 1 Linode with a public IPv6 address located in the selected region.';
      }
      if (connectivity === 'vpc') {
        return 'Please ensure you have at least 1 Linode within a VPC located in the selected region.';
      }
      return 'Please ensure you have at least 1 Linode with a private IPv4 address located in the selected region.';
    } else if (vpcId && !subnetId) {
      return 'Select a subnet within the chosen VPC.';
    } else return 'The selected subnet must have at least one Linode.';
  }, [vpcId, subnetId, connectivity]);

  const ipAddressSelectProps: IPAddressSelectProps = {
    disabled,
    errorText: errorText ?? error?.[0]?.reason,
    label: 'IP Address',
    loading: isLoading,
    noOptionsText,
  };

  return hasCustomIPCapability &&
    nodeBalancerType === 'premium' &&
    connectivity === 'vpc' ? (
    <Select
      clearable
      creatable
      disabled={disabled}
      onChange={(e, value) => {
        const customIPOptions = getCustomIPOptions(vpcIPs);
        handleChange(nodeIndex, value?.label ?? null);
        if (
          value &&
          !customIPOptions.find((option) => option.label === value?.label)
        ) {
          setShowCustomIPNotice(true);
        } else {
          setShowCustomIPNotice(false);
        }
      }}
      options={getCustomIPOptions(vpcIPs)}
      textFieldProps={{
        errorText: errorText ?? error?.[0]?.reason,
        noMarginTop: true,
      }}
      {...ipAddressSelectProps}
      placeholder="Select or enter a custom IP address"
    />
  ) : (
    <Autocomplete
      disabled={disabled}
      id={inputId}
      noMarginTop
      onChange={(e, value: NodeOption) =>
        handleChange(nodeIndex, value?.label ?? null, subnetId)
      }
      options={options}
      placeholder="Enter IP address"
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <ConfigNodeOption key={key} listItemProps={rest} option={option} />
        );
      }}
      value={options.find((o) => o.label === nodeAddress) ?? null}
      {...ipAddressSelectProps}
    />
  );
});
