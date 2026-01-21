import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateDatabaseConnectionPoolMutation } from '@linode/queries';
import {
  ActionsPanel,
  Box,
  Drawer,
  Notice,
  Select,
  TextField,
  Typography,
} from '@linode/ui';
import { createDatabaseConnectionPoolSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { POOL_MODES } from '../../constants';

import type { ConnectionPool } from '@linode/api-v4';

interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
}

const defaultUsername = 'Reuse inbound user'; // Represented as null in the API
const poolModeOptions = POOL_MODES.map((modeOption) => ({
  label: `${modeOption.charAt(0).toUpperCase()}${modeOption.slice(1)}`,
  value: modeOption,
}));
const databaseNamesOptions = [{ label: 'defaultdb', value: 'defaultdb' }]; // Currently the only option for the database name field, but more may be introduced later.
const usernameOptions = [
  { label: defaultUsername, value: defaultUsername },
  { label: 'akmadmin', value: 'akmadmin' },
]; // Currently the only options for the username field

export const DatabaseAddConnectionPoolDrawer = (props: Props) => {
  const { databaseId, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    isPending: submitInProgress,
    mutateAsync: createDatabaseConnectionPool,
    reset: resetMutation,
  } = useCreateDatabaseConnectionPoolMutation(databaseId);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
  } = useForm<ConnectionPool>({
    defaultValues: {
      database: 'defaultdb',
      label: '',
      mode: 'transaction',
      size: 10,
      username: defaultUsername,
    },
    mode: 'onBlur',
    resolver: yupResolver(createDatabaseConnectionPoolSchema),
  });

  const mode = useWatch({ control, name: 'mode' });
  const database = useWatch({ control, name: 'database' });
  const username = useWatch({ control, name: 'username' });

  const handleOnClose = () => {
    onClose();
    reset();
    resetMutation?.();
  };

  const onSubmit = async (values: ConnectionPool) => {
    const payload = {
      ...values,
      username: values.username === defaultUsername ? null : values.username,
    }; // Provide inbound user as null in the API

    try {
      await createDatabaseConnectionPool(payload);
      enqueueSnackbar('Connection Pool added successfully.', {
        variant: 'success',
      });
      handleOnClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <Drawer
      onClose={handleOnClose}
      open={open}
      title="Add a New Connection Pool"
    >
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      <Typography>
        Add a PgBouncer connection pool to minimize the use of your server
        resources.
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mt={2.5}>
          <Controller
            control={control}
            name="label"
            render={({ field, fieldState }) => (
              <TextField
                clearable
                {...field}
                errorText={fieldState.error?.message}
                id="poolLabel"
                label="Pool Label"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                onClear={() => field.onChange('')}
                placeholder="Enter a pool label"
              />
            )}
          />
        </Box>

        <Box mt={2.5}>
          <Controller
            control={control}
            name="database"
            render={({ field, fieldState }) => (
              <Select
                label="Database Name"
                {...field}
                data-testid="database-name-select"
                errorText={fieldState.error?.message}
                id="databaseName"
                onChange={(e, option) => {
                  field.onChange(option.value);
                }}
                options={databaseNamesOptions}
                value={databaseNamesOptions.find(
                  (option) => option.value === database
                )}
              />
            )}
          />
        </Box>

        <Box mt={2.5}>
          <Controller
            control={control}
            name="mode"
            render={({ field, fieldState }) => (
              <Select
                label="Pool Mode"
                {...field}
                data-testid="pool-mode-select"
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
        </Box>

        <Box mt={2.5}>
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
        </Box>

        <Box mt={2.5}>
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState }) => (
              <Select
                label="Username"
                {...field}
                data-testid="username-select"
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
        </Box>

        <ActionsPanel
          primaryButtonProps={{
            label: 'Add Pool',
            loading: submitInProgress,
            type: 'submit',
            'data-testid': 'add-connection-pool-button',
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
