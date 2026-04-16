import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateDatabaseConnectionPoolMutation } from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  Notice,
  Stack,
  TextField,
} from '@linode/ui';
import { updateDatabaseConnectionPoolSchema } from '@linode/validation';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import {
  defaultUsername,
  poolModeOptions,
  usernameOptions,
} from 'src/features/Databases/constants';

import type { ConnectionPool } from '@linode/api-v4';
interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
  pool: ConnectionPool;
}

export const DatabaseEditConnectionPoolDrawer = (props: Props) => {
  const { databaseId, onClose, open, pool } = props;

  const {
    isPending: submitInProgress,
    mutateAsync: updateDatabaseConnectionPool,
    reset: resetMutation,
  } = useUpdateDatabaseConnectionPoolMutation(databaseId, pool.label);

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
    setError,
  } = useForm<Partial<ConnectionPool>>({
    defaultValues: {
      ...pool,
      username: pool.username === null ? defaultUsername : pool.username,
    },
    mode: 'onBlur',
    resolver: yupResolver(updateDatabaseConnectionPoolSchema),
  });

  const handleOnClose = () => {
    onClose();
    reset();
    resetMutation?.();
  };

  const onSubmit = async (_values: ConnectionPool) => {
    const { label, ...values } = _values; // remove label since it is not editable
    const payload = {
      ...values,
      username: values.username === defaultUsername ? null : values.username,
    }; // Provide inbound user as null in the API

    try {
      await updateDatabaseConnectionPool(payload);
      enqueueSnackbar(`Connection Pool ${label} edited successfully.`, {
        variant: 'success',
      });
      handleOnClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const [mode, username] = useWatch({
    control,
    name: ['mode', 'username'],
  });

  return (
    <Drawer onClose={handleOnClose} open={open} title="Edit Connection Pool">
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Controller
            control={control}
            name="label"
            render={({ field, fieldState }) => (
              <TextField
                disabled
                errorText={fieldState.error?.message}
                id="poolLabel"
                label="Pool Label"
                placeholder="Enter a pool label"
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="database"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                errorText={fieldState.error?.message}
                id="databaseName"
                label="Database Name"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                onClear={() => field.onChange('')}
                placeholder="defaultdb"
              />
            )}
          />
          <Controller
            control={control}
            name="mode"
            render={({ field, fieldState }) => (
              <Autocomplete
                autoHighlight
                label="Pool Mode"
                {...field}
                data-testid="pool-mode-select"
                disableClearable={true}
                errorText={fieldState.error?.message}
                id="poolMode"
                onChange={(e, option) => {
                  field.onChange(option.value);
                }}
                options={poolModeOptions}
                value={poolModeOptions.find((option) => option.value === mode)}
              />
            )}
          />
          <Controller
            control={control}
            name="size"
            render={({ field, fieldState }) => (
              <TextField
                id="poolSize"
                {...field}
                data-testid="pool-size-input"
                errorText={fieldState.error?.message}
                label="Pool Size"
                min={1}
                onChange={(e) => {
                  const value =
                    e.target.value.length > 0
                      ? Number(e.target.value)
                      : e.target.value;
                  field.onChange(value);
                }}
                style={{ width: '178px' }}
                type="number"
              />
            )}
          />
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState }) => (
              <Autocomplete
                autoHighlight
                label="Username"
                {...field}
                data-testid="username-select"
                disableClearable={true}
                errorText={fieldState.error?.message}
                id="username"
                onChange={(e, option) => {
                  field.onChange(option.value);
                }}
                options={usernameOptions}
                value={usernameOptions.find(
                  (option) => option.value === username
                )}
              />
            )}
          />
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Save',
            loading: submitInProgress,
            disabled: !isDirty,
            type: 'submit',
            'data-testid': 'save-connection-pool-button',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleOnClose,
          }}
        />
      </form>
    </Drawer>
  );
};
