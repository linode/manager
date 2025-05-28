import { Autocomplete } from '@linode/ui';
import React, { useMemo } from 'react';

import { useDataForLinodesInVPC } from 'src/hooks/useDataForLinodesInVPC';

import {
  getPrivateIPOptions,
  getVPCIPOptions,
} from './ConfigNodeIPSelect.utils';
import { ConfigNodeOption } from './ConfigNodeOption';

import type { PrivateIPOption, VPCIPOption } from './ConfigNodeIPSelect.utils';

interface Props {
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
   * The index of the config node in state
   */
  nodeIndex: number;
  /**
   * The region for which to load Linodes and to show private IPs
   * @note IPs won't load until a region is passed
   */
  region: string | undefined;
  /**
   * The subnetID for which to load the available VPC IPs
   */
  subnetId?: number;
  /**
   * The vpcId for which to load available VPC IPs
   */
  vpcId?: null | number;
}

export type NodeOption = PrivateIPOption | VPCIPOption;

export const ConfigNodeIPSelect = React.memo((props: Props) => {
  const {
    disabled,
    errorText,
    handleChange,
    inputId,
    nodeAddress,
    nodeIndex,
    region,
    vpcId,
    subnetId,
  } = props;

  const { linodeData, linodeIpData, error, isLoading, subnetData } =
    useDataForLinodesInVPC({
      region,
      vpcId,
      subnetId,
    });

  let options: NodeOption[] = [];

  if (region) {
    options = getPrivateIPOptions(linodeData);
  }
  if (region && vpcId) {
    options = getVPCIPOptions(linodeIpData, linodeData, subnetData);
  }

  const noOptionsText = useMemo(() => {
    if (!vpcId) {
      return 'No options - please ensure you have at least 1 Linode with a private IP located in the selected region.';
    } else if (vpcId && !subnetId) {
      return 'No options - please ensure you have selected a Subnet from the selected VPC';
    } else
      return 'No options - please ensure you have at least 1 Linode in the selected Subnet.';
  }, [vpcId, subnetId]);

  return (
    <Autocomplete
      disabled={disabled}
      errorText={errorText ?? error?.[0]?.reason}
      id={inputId}
      label="IP Address"
      loading={isLoading}
      noMarginTop
      noOptionsText={noOptionsText}
      onChange={(e, value) =>
        handleChange(
          nodeIndex,
          value?.label ?? null,
          value && 'subnetId' in value ? value?.subnetId : undefined
        )
      }
      options={options}
      placeholder="Enter IP Address"
      renderOption={(props, option, { selected }) => {
        const { key, ...rest } = props;
        return (
          <ConfigNodeOption
            key={key}
            listItemProps={rest}
            option={option}
            selected={selected}
          />
        );
      }}
      value={options.find((o) => o.label === nodeAddress) ?? null}
    />
  );
});
