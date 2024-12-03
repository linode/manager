import { Autocomplete } from '@linode/ui';
import React from 'react';

import { useVPCsQuery } from 'src/queries/vpcs/vpcs';

import type { Filter, VPC } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from '@linode/ui';

interface Props extends Partial<Omit<EnhancedAutocompleteProps<VPC>, 'value'>> {
  /**
   * An optional API filter to filter the VPC options
   */
  filter?: Filter;
  /**
   * The ID of the selected VPC
   */
  value: null | number | undefined;
}

export const VPCSelect = (props: Props) => {
  const { filter, value, ...rest } = props;

  const { data, isFetching } = useVPCsQuery({}, filter ?? {});

  const selectedVPC = data?.data.find((vpc) => vpc.id === value) ?? null;

  return (
    <Autocomplete
      label="VPC"
      loading={isFetching}
      options={data?.data ?? []}
      value={selectedVPC}
      {...rest}
    />
  );
};
