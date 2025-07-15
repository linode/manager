import { useAllVPCsQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import React from 'react';

interface VPCSubnetOption {
  /**
   * Unique identifier for the subnet.
   */
  id: number;
  /**
   * Display label for the subnet, typically includes VPC name.
   */
  label: string;
}

interface CloudPulseVPCSubnetSelectProps {
  /**
   * Error text to display when there is an error.
   */
  errorText?: string;
  /**
   * Label for the autocomplete field.
   */
  label?: string;
  /**
   * Whether to allow multiple selections.
   */
  multiple?: boolean;
  /**
   * This function is called when the input field loses focus.
   */
  onBlur?: () => void;
  /**
   * Callback function when the value changes.
   * @param value - The selected value(s).
   */
  onChange: (value: null | number | number[]) => void;
  /**
   * Placeholder text for the autocomplete field.
   */
  placeholder?: string;
  /**
   * The default selected value for the component.
   */
  value?: number | number[];
}

export const CloudPulseVPCSubnetSelect = (
  props: CloudPulseVPCSubnetSelectProps
) => {
  const { errorText, onChange, value, onBlur, label, placeholder, multiple } =
    props;

  const [selectedValue, setSelectedValue] = React.useState<
    null | number | number[]
  >(value ?? null);
  const { data, isLoading, error } = useAllVPCsQuery({ enabled: true });

  // Creating a mapping of subnet id to options for constant time access to fetch selected options
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
      return multiple ? [] : null;
    }
    if (isArray) {
      const selectedOptions = selectedValue
        .filter((value) => options[value] !== undefined)
        .map((value) => options[value]);

      return multiple ? selectedOptions : (selectedOptions[0] ?? null);
    }

    const selectedOption = options[selectedValue];

    if (multiple) {
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
      multiple={multiple}
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
      value={getSelectedOptions()}
    />
  );
};
