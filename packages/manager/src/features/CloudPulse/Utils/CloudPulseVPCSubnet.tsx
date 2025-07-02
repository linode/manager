import { useAllVPCsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';

interface VPCSubnetOption {
  id: number;
  label: string;
}

interface CloudPulseVPCSubnetProps {
  errorText?: string;
  onBlur?: () => void;
  onChange: (value: number[]) => void;
  value?: number[];
}

export const CloudPulseVPCSubnet = (props: CloudPulseVPCSubnetProps) => {
  const { errorText, onChange, value, onBlur } = props;

  const [selectedValue, setSelectedValue] = React.useState<number[]>(
    value || []
  );
  const { data, isLoading, error } = useAllVPCsQuery({ enabled: true });

  const options: VPCSubnetOption[] = React.useMemo(() => {
    if (!data) return [];

    const options: VPCSubnetOption[] = [];

    for (const { label: vpcLabel, subnets } of data) {
      options.push(
        ...subnets.map(({ id: subnetId, label: subnetLabel }) => ({
          id: subnetId,
          label: `${vpcLabel}_${subnetLabel}`,
        }))
      );
    }

    return options;
  }, [data]);

  return (
    <Autocomplete
      data-testid="vpc-subnet-filter"
      errorText={errorText ?? error?.[0].reason}
      fullWidth
      isOptionEqualToValue={(option, value) => option.id === value.id}
      label="VPC Subnet"
      limitTags={2}
      loading={isLoading}
      multiple
      onBlur={onBlur}
      onChange={(_, newValue) => {
        const newSelectedValue = newValue.map(({ id }) => id);
        setSelectedValue(newSelectedValue);
        onChange?.(newSelectedValue);
      }}
      options={options}
      placeholder="Select a VPC Subnet"
      textFieldProps={{
        InputProps: {
          sx: {
            '::-webkit-scrollbar': {
              display: 'none',
            },
            maxHeight: '55px',
            msOverflowStyle: 'none',
            overflow: 'auto',
            scrollbarWidth: 'none',
          },
        },
      }}
      value={options.filter(({ id }) => selectedValue.includes(id))}
    />
  );
};
