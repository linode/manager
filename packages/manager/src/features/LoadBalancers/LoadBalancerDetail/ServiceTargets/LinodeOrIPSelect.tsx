import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { SelectedIcon } from 'src/components/Autocomplete/Autocomplete.styles';
import { Box } from 'src/components/Box';
import { Stack } from 'src/components/Stack';
import { linodeFactory } from 'src/factories';
import { useInfiniteLinodesQuery } from 'src/queries/linodes/linodes';
import { useRegionsQuery } from 'src/queries/regions';

import type { Filter } from '@linode/api-v4';
import type { TextFieldProps } from 'src/components/TextField';

interface Props {
  /**
   * Error text to display as helper text under the TextField. Useful for validation errors.
   */
  errorText?: string;
  /**
   * Called when the value of the Select changes
   */
  onChange: (ip: string) => void;
  /**
   * Optional props passed to the TextField
   */
  textFieldProps?: Partial<TextFieldProps>;
  /**
   * The id of the selected certificate
   */
  value: null | string;
}

export const LinodeOrIPSelect = (props: Props) => {
  const { errorText, onChange, textFieldProps, value } = props;

  const [inputValue, setInputValue] = React.useState<string>('');

  const filter: Filter = {};

  // If the user types in the Autocomplete, API filter for Linodes.
  if (inputValue) {
    filter['+or'] = [
      { label: { '+contains': inputValue } },
      { ipv4: { '+contains': inputValue } },
    ];
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteLinodesQuery(filter);

  const { data: regions } = useRegionsQuery();

  const linodes = data?.pages.flatMap((page) => page.data) ?? [];

  const selectedLinode = value
    ? linodes?.find((linode) => linode.ipv4.includes(value)) ?? null
    : null;

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

  const customIpPlaceholder = linodeFactory.build({
    ipv4: [inputValue],
    label: `Use IP ${inputValue}`,
  });

  const options = [...linodes];

  if (linodes.length === 0 && !isLoading) {
    options.push(customIpPlaceholder);
  }

  return (
    <Autocomplete
      ListboxProps={{
        onScroll,
      }}
      onInputChange={(_, value, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(value);
          onChange(value);
        }
      }}
      renderOption={(props, option, state) => {
        const region =
          regions?.find((r) => r.id === option.region)?.label ?? option.region;

        const isCustomIp = option === customIpPlaceholder;

        return (
          <li {...props}>
            <Stack flexGrow={1}>
              <Box>
                <b>{isCustomIp ? 'Custom IP' : option.label}</b>
              </Box>
              <Box>
                {isCustomIp ? option.ipv4[0] : `${option.ipv4[0]} - ${region}`}
              </Box>
            </Stack>
            <SelectedIcon visible={state.selected} />
          </li>
        );
      }}
      errorText={error?.[0]?.reason ?? errorText}
      filterOptions={(x) => x}
      fullWidth
      inputValue={selectedLinode ? selectedLinode.label : inputValue}
      label="Linode or Public IP Address"
      loading={isLoading}
      onChange={(e, value) => onChange(value?.ipv4[0] ?? '')}
      options={options}
      placeholder="Select Linode or Enter IPv4 Address"
      textFieldProps={textFieldProps}
      value={linodes.length === 0 ? customIpPlaceholder : selectedLinode}
    />
  );
};
