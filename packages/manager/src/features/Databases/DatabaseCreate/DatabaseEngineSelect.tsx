import { useDatabaseEnginesQuery } from '@linode/queries';
import { Autocomplete, Box, InputAdornment } from '@linode/ui';
import Grid from '@mui/material/Grid';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { getEngineOptions } from 'src/features/Databases/DatabaseCreate/utilities';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { DatabaseCreateValues } from './DatabaseCreate';

export const DatabaseEngineSelect = () => {
  const { data: engines } = useDatabaseEnginesQuery(true);
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  const engineOptions = React.useMemo(() => {
    if (!engines) {
      return [];
    }
    return getEngineOptions(engines);
  }, [engines]);

  const { control } = useFormContext<DatabaseCreateValues>();

  const engineValue = useWatch({ control, name: 'engine' });
  const selectedEngine = React.useMemo(() => {
    return engineOptions.find((val) => val.value === engineValue);
  }, [engineValue, engineOptions]);

  return (
    <Controller
      control={control}
      name="engine"
      render={({ field, fieldState }) => (
        <Autocomplete
          autoHighlight
          disableClearable
          disabled={isRestricted}
          errorText={fieldState.error?.message}
          groupBy={(option) => {
            if (option.engine.match(/mysql/i)) {
              return 'MySQL';
            }
            if (option.engine.match(/postgresql/i)) {
              return 'PostgreSQL';
            }
            return 'Other';
          }}
          label="Database Engine"
          onChange={(_, selected) => {
            field.onChange(selected.value);
          }}
          options={engineOptions ?? []}
          placeholder="Select a Database Engine"
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li {...rest} data-testid="db-engine-option" key={key}>
                <Grid
                  container
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                >
                  <Grid className="py0" height="20px" width="20px">
                    {option.flag}
                  </Grid>
                  <Grid>{option.label}</Grid>
                </Grid>
              </li>
            );
          }}
          textFieldProps={{
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ pt: 0.7, svg: { height: '20px', width: '20px' } }}>
                    {selectedEngine?.flag}
                  </Box>
                </InputAdornment>
              ),
            },
          }}
          value={selectedEngine}
        />
      )}
    />
  );
};
