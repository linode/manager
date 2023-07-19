import { NodeBalancer } from '@linode/api-v4';
import Autocomplete from '@mui/material/Autocomplete';
import * as React from 'react';

import { TextField, TextFieldProps } from 'src/components/TextField';
import { useInfiniteNodebalancersQuery } from 'src/queries/nodebalancers';

interface Props {
  disabled?: boolean;
  error?: string;
  onChange: (id: number, nodebalancer: NodeBalancer | undefined) => void;
  region?: string;
  textFieldProps?: TextFieldProps;
  value?: number;
}

export const NodeBalancerSelect = (props: Props) => {
  const { disabled, error, onChange, region, value } = props;
  const [inputValue, setInputValue] = React.useState<string>('');

  const searchFilter = inputValue
    ? {
        '+or': [
          { label: { '+contains': inputValue } },
          { tags: { '+contains': inputValue } },
        ],
      }
    : {};

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteNodebalancersQuery({
    ...searchFilter,
    ...(region ? { region } : {}),
    '+order': 'asc',
    '+order_by': 'label',
  });
  const nodebalancers = data?.pages.flatMap((page) => page.data);

  const options = nodebalancers?.map(({ id, label }) => ({ id, label }));

  const selectedNodebalancer =
    options?.find((option) => option.id === value) ?? null;

  return (
    <Autocomplete
      ListboxProps={{
        onScroll: (event: React.SyntheticEvent) => {
          const listboxNode = event.currentTarget;
          if (
            listboxNode.scrollTop + listboxNode.clientHeight >=
              listboxNode.scrollHeight &&
            hasNextPage
          ) {
            fetchNextPage();
          }
        },
      }}
      onChange={(event, value) =>
        onChange(
          value?.id ?? -1,
          nodebalancers?.find((n) => n.id === value?.id)
        )
      }
      onInputChange={(event, value) => {
        setInputValue(value);
      }}
      renderInput={(params) => (
        <TextField
          errorText={error}
          label="NodeBalancer"
          loading={isLoading}
          placeholder="Select a NodeBalancer"
          {...params}
        />
      )}
      disabled={disabled}
      inputValue={inputValue}
      isOptionEqualToValue={(option) => option.id === selectedNodebalancer?.id}
      loading={isLoading}
      options={options ?? []}
      value={selectedNodebalancer}
    />
  );
};
