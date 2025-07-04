import { useAllVPCsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';

interface VPCSubnetOption {
  id: number;
  label: string;
}

interface CloudPulseVPCSubnetProps {
  errorText?: string;
  isMultiple?: boolean;
  label?: string;
  onBlur?: () => void;
  onChange: (value: null | number | number[]) => void;
  placeholder?: string;
  value?: number | number[];
}

export const CloudPulseVPCSubnet = (props: CloudPulseVPCSubnetProps) => {
  const { errorText, onChange, value, onBlur, label, placeholder, isMultiple } =
    props;

  const [selectedValue, setSelectedValue] = React.useState<
    null | number | number[]
  >(value ?? null);
  const { data, isLoading, error } = useAllVPCsQuery({ enabled: true });

  const options: Record<number, VPCSubnetOption> = React.useMemo(() => {
    if (!data) return {};

    const options: Record<number, VPCSubnetOption> = [];

    for (const { label: vpcLabel, subnets } of data) {
      subnets.forEach(({ id: subnetId, label: subnetLabel }) => {
        options[subnetId] = {
          id: subnetId,
          label: `${vpcLabel}_${subnetLabel}`,
        };
      });
    }

    return options;
  }, [data]);
  const isArray = selectedValue && Array.isArray(selectedValue);
  const getSelectedOptions = (): null | VPCSubnetOption | VPCSubnetOption[] => {
    if (selectedValue === null) {
      return isMultiple ? [] : null;
    }
    if (isArray) {
      const selectedOptions = selectedValue
        .filter((value) => options[value] !== undefined)
        .map((value) => options[value]);

      return isMultiple ? selectedOptions : (selectedOptions[0] ?? null);
    }

    const selectedOption = options[selectedValue];

    if (isMultiple) {
      return selectedOption ? [selectedOption] : [];
    }

    return selectedOption ?? null;
  };

  return (
    <Autocomplete
      data-testid="vpc-subnet-filter"
      errorText={errorText ?? error?.[0].reason}
      fullWidth
      isOptionEqualToValue={(option, value) => option.id === value.id}
      label={label ?? 'VPC Subnet'}
      limitTags={2}
      loading={isLoading}
      multiple={isMultiple}
      onBlur={onBlur}
      onChange={(_, newValue) => {
        const newSelectedValue = Array.isArray(newValue)
          ? newValue.map(({ id }) => id)
          : (newValue?.id ?? null);
        setSelectedValue(newSelectedValue);
        onChange?.(newSelectedValue);
      }}
      options={Object.values(options)}
      placeholder={placeholder ?? 'Select VPC Subnets'}
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
      value={getSelectedOptions()}
    />
  );
};
