import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { SelectedIcon } from 'src/components/Autocomplete/Autocomplete.styles';
import { Box } from 'src/components/Box';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

import { getPrivateIPOptions } from './ConfigNodeIPSelect.utils';

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
  handleChange: (nodeIndex: number, ipAddress: null | string) => void;
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
}

export const ConfigNodeIPSelect = React.memo((props: Props) => {
  const {
    disabled,
    errorText,
    handleChange,
    inputId,
    nodeAddress,
    nodeIndex,
    region,
  } = props;

  const { data: linodes, error, isLoading } = useAllLinodesQuery(
    {},
    { region },
    region !== undefined
  );

  const options = getPrivateIPOptions(linodes);

  return (
    <Autocomplete
      renderOption={(props, option, { selected }) => (
        <li {...props} key={props.key}>
          <Box
            alignItems="center"
            display="flex"
            flexDirection="row"
            gap={1}
            justifyContent="space-between"
            width="100%"
          >
            <Stack>
              <Typography
                color="inherit"
                fontFamily={(theme) => theme.font.bold}
              >
                {option.label}
              </Typography>
              <Typography color="inherit">{option.linode.label}</Typography>
            </Stack>
            {selected && <SelectedIcon visible />}
          </Box>
        </li>
      )}
      disabled={disabled}
      errorText={errorText ?? error?.[0].reason}
      id={inputId}
      label="IP Address"
      loading={isLoading}
      noMarginTop
      noOptionsText="No options - please ensure you have at least 1 Linode with a private IP located in the selected region."
      onChange={(e, value) => handleChange(nodeIndex, value?.label ?? null)}
      options={options}
      placeholder="Enter IP Address"
      value={options.find((o) => o.label === nodeAddress) ?? null}
    />
  );
});
