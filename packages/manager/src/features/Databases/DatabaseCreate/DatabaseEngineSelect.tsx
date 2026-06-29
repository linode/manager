import { Badge } from '@akamai/cds-components/react/Badge';
import { Spacing } from '@akamai/cds-tokens';
import { useDatabaseEnginesQuery } from '@linode/queries';
import { Autocomplete, InputAdornment } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { getEngineOptions } from 'src/features/Databases/DatabaseCreate/utilities';
import { DATABASE_ENGINE_MAP } from 'src/features/Databases/utilities';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { Stack } from '../shared/Stack/Stack';
import styles from './DatabaseEngineSelect.module.css';

import type { DatabaseCreateValues } from './DatabaseCreate';

export const DatabaseEngineSelect = () => {
  const { data: engines } = useDatabaseEnginesQuery(true);
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });
  const flags = useFlags();

  const engineOptions = React.useMemo(() => {
    if (!engines) {
      return [];
    }
    return getEngineOptions(engines);
  }, [engines]);

  const { control, setValue } = useFormContext<DatabaseCreateValues>();

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
            return DATABASE_ENGINE_MAP[option.engine] ?? 'Other';
          }}
          label="Database Engine"
          onChange={(_, selected) => {
            field.onChange(selected.value);
            setValue('type', '');
          }}
          options={engineOptions ?? []}
          placeholder="Select a Database Engine"
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li {...rest} data-testid="db-engine-option" key={key}>
                <Stack direction="row" spacing={Spacing.S16} width="100%">
                  {option.flag}
                  <Stack flexGrow={1}>{option.label}</Stack>
                  {option.engine === 'valkey' &&
                    flags.databaseValkey?.enabled &&
                    flags.databaseValkey.beta && (
                      <Badge color="neutral" variant="solid">
                        Beta
                      </Badge>
                    )}
                </Stack>
              </li>
            );
          }}
          textFieldProps={{
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <div className={styles.engineIconWrapper}>
                    {selectedEngine?.flag}
                  </div>
                </InputAdornment>
              ),
              endAdornment: selectedEngine?.engine === 'valkey' &&
                flags.databaseValkey?.enabled &&
                flags.databaseValkey.beta && (
                  <Badge color="neutral" variant="solid">
                    Beta
                  </Badge>
                ),
            },
          }}
          value={selectedEngine}
        />
      )}
    />
  );
};
