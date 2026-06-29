import { Autocomplete, Box, InputAdornment, Stack } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { providerIcon, providerIconStyles } from '../../utils';

import type { ModelFilterState } from '../modelLibrary.types';

interface ProviderFilterProps {
  onFilterChange: (next: Partial<ModelFilterState>) => void;
  providerLabel: null | string;
  providers: string[];
}

export const ProviderFilter = ({
  onFilterChange,
  providerLabel,
  providers,
}: ProviderFilterProps) => {
  const cmTheme = useTheme();

  const providerOptions = providers.map((p) => ({ label: p, value: p }));
  const selectedProvider = providerLabel
    ? (providerOptions.find((o) => o.value === providerLabel) ?? null)
    : null;

  return (
    <Box sx={{ flex: '1 1 180px', minWidth: 160 }}>
      <Autocomplete
        disableClearable={false}
        label="Provider"
        onChange={(_, option) => {
          onFilterChange({
            providerLabel:
              (option as null | { label: string; value: string })?.value ??
              null,
          });
        }}
        options={providerOptions}
        placeholder="All providers"
        renderOption={(props, option) => {
          const { key, ...rest } = props as typeof props & { key: string };
          const Icon = providerIcon(option.value.toString());
          return (
            <li key={key} {...rest}>
              <Stack alignItems="center" direction="row" gap={1}>
                {Icon && (
                  <Box
                    component={Icon}
                    height={20}
                    style={providerIconStyles(option.value.toString(), cmTheme)}
                    width={20}
                  />
                )}
                <span>{option.label}</span>
              </Stack>
            </li>
          );
        }}
        textFieldProps={
          selectedProvider
            ? {
                InputProps: {
                  startAdornment: (() => {
                    const Icon = providerIcon(selectedProvider.value);
                    return Icon ? (
                      <InputAdornment position="start">
                        <Box
                          component={Icon}
                          height={18}
                          style={providerIconStyles(
                            selectedProvider.value,
                            cmTheme
                          )}
                          width={18}
                        />
                      </InputAdornment>
                    ) : null;
                  })(),
                },
              }
            : undefined
        }
        value={selectedProvider}
      />
    </Box>
  );
};
