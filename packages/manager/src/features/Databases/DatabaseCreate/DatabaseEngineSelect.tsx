import { Autocomplete, Box } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import React from 'react';

import { getEngineOptions } from 'src/features/Databases/DatabaseCreate/utilities';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { DatabaseEngine } from '@linode/api-v4';

interface Props {
  engines: DatabaseEngine[] | undefined;
  errorText: string | undefined;
  onChange: (filed: string, value: any) => void;
  value: string;
}

export const DatabaseEngineSelect = (props: Props) => {
  const { engines, errorText, onChange, value } = props;
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  const engineOptions = React.useMemo(() => {
    if (!engines) {
      return [];
    }
    return getEngineOptions(engines);
  }, [engines]);

  const selectedEngine = React.useMemo(() => {
    return engineOptions.find((val) => val.value === value);
  }, [value, engineOptions]);

  return (
    <Autocomplete
      groupBy={(option) => {
        if (option.engine.match(/mysql/i)) {
          return 'MySQL';
        }
        if (option.engine.match(/postgresql/i)) {
          return 'PostgreSQL';
        }
        if (option.engine.match(/mongodb/i)) {
          return 'MongoDB';
        }
        if (option.engine.match(/redis/i)) {
          return 'Redis';
        }
        return 'Other';
      }}
      onChange={(_, selected) => {
        onChange('engine', selected.value);
      }}
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
              <Grid className="py0">{option.flag}</Grid>
              <Grid>{option.label}</Grid>
            </Grid>
          </li>
        );
      }}
      textFieldProps={{
        InputProps: {
          startAdornment: (
            <Box sx={{ pr: 1, pt: 0.7 }}>{selectedEngine?.flag}</Box>
          ),
        },
      }}
      autoHighlight
      disableClearable
      disabled={isRestricted}
      errorText={errorText}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      label="Database Engine"
      options={engineOptions ?? []}
      placeholder="Select a Database Engine"
      value={selectedEngine}
    />
  );
};
