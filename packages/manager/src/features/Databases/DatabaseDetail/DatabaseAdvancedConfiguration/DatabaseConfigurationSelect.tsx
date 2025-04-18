import { Autocomplete, TextField } from '@linode/ui';
import React from 'react';

import { GroupHeader, GroupItems } from './DatabaseAdvancedConfiguration.style';

import type { ConfigurationItem, ConfigValue } from '@linode/api-v4';

export interface ConfigurationOption extends ConfigurationItem {
  category: string;
  isNew?: boolean;
  label: string;
  value?: ConfigValue;
}

interface Props {
  configurations: ConfigurationOption[];
  errorText: string | undefined;
  label: string;
  onChange: (value: ConfigurationOption) => void;
}

export const DatabaseConfigurationSelect = (props: Props) => {
  const { configurations, errorText, label, onChange } = props;

  const selectedConfig = configurations.find((val) => val.label === label);

  return (
    <Autocomplete
      autoHighlight
      clearIcon={null}
      getOptionLabel={(option) => option.label}
      groupBy={(option) => {
        if (option.category === 'other') {
          return 'other';
        }
        return option.category;
      }}
      isOptionEqualToValue={(option, selectedValue) =>
        option.label === selectedValue.label
      }
      label={''}
      onChange={(_, selected) => {
        onChange(selected!);
      }}
      options={[...configurations].sort((a, b) => {
        if (a.category === 'other') return 1;
        if (b.category === 'other') return -1;
        return a.category.localeCompare(b.category);
      })}
      renderGroup={(params) => (
        <li key={params.key}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          error={!!errorText}
          helperText={errorText}
          label="Add a Configuration Option"
          placeholder="Select a configuration option"
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={props.id}>
          {option.label}
        </li>
      )}
      slotProps={{
        listbox: {
          style: {
            padding: 0,
          },
        },
      }}
      sx={{
        width: '316px',
      }}
      value={selectedConfig ?? null}
    />
  );
};
