import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useLoadBalancerServiceTargetsInfiniteQuery } from 'src/queries/aglb/serviceTargets';

import type { Filter, ServiceTarget } from '@linode/api-v4';
import type { SxProps } from '@mui/material';
import { TextFieldProps } from 'src/components/TextField';

interface Props {
  /**
   * Error text to display as helper text under the TextField. Useful for validation errors.
   */
  errorText?: string;
  /**
   * The TextField label
   * @default Service Target
   */
  label?: string;
  /**
   * The id of the Load Balancer you want to show certificates for
   */
  loadbalancerId: number;
  /**
   * Called when the value of the Select changes
   */
  onChange: (serviceTarget: ServiceTarget | null) => void;
  /**
   * Optional styles
   */
  sx?: SxProps;
  /**
   * Optional props to pass to the underlying TextField
   */
  textFieldProps?: Partial<TextFieldProps>;
  /**
   * The id of the selected service target
   */
  value: number;
}

export const ServiceTargetSelect = (props: Props) => {
  const {
    errorText,
    label,
    loadbalancerId,
    onChange,
    value,
    sx,
    textFieldProps,
  } = props;

  const [inputValue, setInputValue] = React.useState<string>('');

  const filter: Filter = {};

  if (inputValue) {
    filter['label'] = { '+contains': inputValue };
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useLoadBalancerServiceTargetsInfiniteQuery(loadbalancerId, filter);

  const serviceTargets = data?.pages.flatMap((page) => page.data);

  const selectedServiceTarget =
    serviceTargets?.find((serviceTarget) => serviceTarget.id === value) ?? null;

  const onScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >=
        listboxNode.scrollHeight &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  };

  return (
    <Autocomplete
      ListboxProps={{
        onScroll,
      }}
      inputValue={
        selectedServiceTarget ? selectedServiceTarget.label : inputValue
      }
      onInputChange={(_, value, reason) => {
        if (reason === 'input') {
          setInputValue(value);
        }
      }}
      errorText={error?.[0].reason ?? errorText}
      label={label ?? 'Service Target'}
      loading={isLoading}
      noMarginTop
      onChange={(e, value) => onChange(value)}
      options={serviceTargets ?? []}
      placeholder="Select a Service Target"
      sx={sx}
      textFieldProps={textFieldProps}
      value={selectedServiceTarget}
    />
  );
};
