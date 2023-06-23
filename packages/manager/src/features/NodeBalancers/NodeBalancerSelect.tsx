import { NodeBalancer } from '@linode/api-v4';
import Autocomplete from '@mui/material/Autocomplete';
import * as React from 'react';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';
import { useInfiniteNodebalancersQuery } from 'src/queries/nodebalancers';

interface Props {
  error?: string;
  value?: number;
  disabled?: boolean;
  region?: string;
  onChange: (id: number, nodebalancer: NodeBalancer | undefined) => void;
  textFieldProps?: TextFieldProps;
}

export const NodeBalancerSelect = (props: Props) => {
  const { disabled, error, onChange, value, region } = props;
  const [inputValue, setInputValue] = React.useState<string>('');

  const searchFilter = inputValue
    ? {
        '+or': [
          { label: { '+contains': inputValue } },
          { tags: { '+contains': inputValue } },
        ],
      }
    : {};

  const { data, isLoading, fetchNextPage, hasNextPage } =
    useInfiniteNodebalancersQuery({
      ...searchFilter,
      ...(region ? { region } : {}),
      '+order_by': 'label',
      '+order': 'asc',
    });
  const nodebalancers = data?.pages.flatMap((page) => page.data);

  const options = nodebalancers?.map(({ id, label }) => ({ id, label }));

  const selectedNodebalancer =
    options?.find((option) => option.id === value) ?? null;

  return (
    <Autocomplete
      disabled={disabled}
      options={options ?? []}
      value={selectedNodebalancer}
      onChange={(event, value) =>
        onChange(
          value?.id ?? -1,
          nodebalancers?.find((n) => n.id === value?.id)
        )
      }
      inputValue={inputValue}
      onInputChange={(event, value) => {
        setInputValue(value);
      }}
      isOptionEqualToValue={(option) => option.id === selectedNodebalancer?.id}
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
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          label="NodeBalancer"
          placeholder="Select a NodeBalancer"
          loading={isLoading}
          errorText={error}
          {...params}
        />
      )}
    />
  );
};
