import { Autocomplete, Button, TextField } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import React from 'react';

interface ConfigurationOption {
  category: string;
  description: string;
  label: string;
}

interface Props {
  configurations: ConfigurationOption[];
  errorText: string | undefined;
  onChange: (value: string) => void;
  value: string;
}

export const DatabaseConfigurationSelect = (props: Props) => {
  const { configurations, errorText, onChange, value } = props;

  const selectedConfiguration = React.useMemo(() => {
    return configurations.find((val) => val.label === value);
  }, [value, configurations]);

  return (
    <Grid
      alignItems={'end'}
      container
      justifyContent="space-between"
      size={{ lg: 12 }}
    >
      <Grid size={{ xs: 9 }}>
        <Autocomplete
          groupBy={(option) => {
            if (option.category === 'Other') {
              return 'Other';
            }
            return option.category;
          }}
          isOptionEqualToValue={(option, selectedValue) =>
            option.label === selectedValue.label
          }
          onChange={(_, selected) => {
            onChange(selected.label);
          }}
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
            <li {...props}>
              <div>
                <strong>{option.label}</strong>
                {/* TODO: Add description if needed */}
                {/* {option.description && <div>{option.description}</div>} */}
              </div>
            </li>
          )}
          autoHighlight
          disableClearable
          getOptionLabel={(option) => option.label}
          label={''}
          options={configurations}
          sx={{ width: '336px' }}
          value={selectedConfiguration}
        />
      </Grid>
      <Grid size={{ xs: 2 }}>
        <Button
          buttonType="primary"
          disabled={!selectedConfiguration}
          sx={{ minWidth: 'auto', width: '70px' }}
        >
          Add
        </Button>
      </Grid>
    </Grid>
  );
};
