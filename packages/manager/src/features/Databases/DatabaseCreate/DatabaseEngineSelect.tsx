import { Box } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { getEngineOptions } from 'src/features/Databases/DatabaseCreate/utilities';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { DatabaseCreateValues } from './DatabaseClusterData';
import type { DatabaseEngine } from '@linode/api-v4';
import type { FormikErrors } from 'formik';
import type { Item } from 'src/components/EnhancedSelect';

interface Props {
  engines: DatabaseEngine[] | undefined;
  errors: FormikErrors<DatabaseCreateValues>;
  onChange: (filed: string, value: any) => void;
  values: DatabaseCreateValues;
}
export const DatabaseEngineSelect = (props: Props) => {
  const { engines, errors, onChange, values } = props;
  const [selectedValue, setSelectedValue] = React.useState('');
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  const engineOptions = React.useMemo(() => {
    if (!engines) {
      return [];
    }
    return getEngineOptions(engines);
  }, [engines]);
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
      onChange={(_, selected: Item<string>) => {
        onChange('engine', selected.value);
        setSelectedValue(selected.label);
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <li {...rest} data-testid="db-engine-option" key={key}>
            <Grid
              alignItems="center"
              container
              direction="row"
              justifyContent="flex-start"
              spacing={2}
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
            <Box sx={{ pr: 1, pt: 0.7 }}>
              {engineOptions?.find((val) => val.label === selectedValue)?.flag}
            </Box>
          ),
        },
      }}
      autoHighlight
      clearOnBlur={true}
      disableClearable={true}
      disabled={isRestricted}
      errorText={errors.engine}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      label="Database Engine"
      options={engineOptions ?? []}
      placeholder="Select a Database Engine"
      value={engineOptions?.find((val) => val.label === values.label)}
    />
  );
};
