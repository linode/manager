import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateDatabaseConnectionPoolMutation } from '@linode/queries';
import {
  Box,
  Button,
  Drawer,
  FormHelperText,
  InputLabel,
  Notice,
  TextField,
  Typography,
  useTheme,
} from '@linode/ui';
import { createDatabaseConnectionPoolSchema } from '@linode/validation';
import { Select } from 'akamai-cds-react-components';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { ConnectionPool, PoolMode } from '@linode/api-v4';

interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
}

export const DatabaseConnectionPoolAddDrawer = (props: Props) => {
  const { databaseId, onClose, open } = props;
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const defaultUsername = 'Reuse inbound user'; // Represented as null in the API

  const {
    isPending: submitInProgress,
    mutateAsync: createDatabaseConnectionPool,
    reset: resetMutation,
  } = useCreateDatabaseConnectionPoolMutation(databaseId);

  const {
    control,
    formState: { errors },
    watch,
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

  const poolModes: PoolMode[] = ['transaction', 'session', 'statement']; // Should this be exported?
  const databaseNames = ['defaultdb']; // Currently the only option for the database name field, but more may be introduced later.
  const usernames = [defaultUsername, 'akmadmin'];
  const { mode, database, username } = watch();

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
        <Box
          style={{
            marginTop: theme.spacingFunction(20),
          }}
        />
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
            />
          )}
        />

        <Box
          style={{
            marginTop: theme.spacingFunction(20),
          }}
        >
          <InputLabel
            htmlFor="databaseName"
            style={{
              marginBottom: theme.spacingFunction(8),
            }}
          >
            Database Name
          </InputLabel>
          <Controller
            control={control}
            name="database"
            render={({ field, fieldState }) => (
              <>
                <Select
                  {...field}
                  id="databaseName"
                  items={databaseNames}
                  onChange={(e: CustomEvent) => {
                    field.onChange(e.detail);
                  }}
                  placeholder="Choose a Database Name"
                  selected={databaseNames.find((name) => name === database)}
                />
                {fieldState.error?.message && (
                  <FormHelperText error role="alert" sx={{ marginTop: 0 }}>
                    {fieldState.error?.message}
                  </FormHelperText>
                )}
              </>
            )}
          />
        </Box>

        <Box
          style={{
            marginTop: theme.spacingFunction(20),
          }}
        >
          <InputLabel
            htmlFor="poolMode"
            style={{
              marginBottom: theme.spacingFunction(8),
            }}
          >
            Pool Mode
          </InputLabel>
          <Controller
            control={control}
            name="mode"
            render={({ field }) => (
              <Select
                {...field}
                id="poolMode"
                items={poolModes}
                onChange={(e: CustomEvent) => {
                  field.onChange(e.detail);
                }}
                placeholder="Choose a Pool Mode"
                selected={poolModes.find((poolMode) => mode === poolMode)}
                valueFn={(poolMode: PoolMode) => {
                  return `${poolMode.charAt(0).toUpperCase()}${poolMode.slice(1)}`;
                }}
              />
            )}
          />
        </Box>
        <Box
          style={{
            marginTop: theme.spacingFunction(20),
          }}
        >
          <Controller
            control={control}
            name="size"
            render={({ field, fieldState }) => (
              <TextField
                id="poolSize"
                {...field}
                errorText={fieldState.error?.message}
                label="Pool Size"
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

        <Box
          style={{
            marginTop: theme.spacingFunction(20),
          }}
        >
          <InputLabel
            htmlFor="username"
            style={{
              marginBottom: theme.spacingFunction(8),
            }}
          >
            Username
          </InputLabel>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <Select
                {...field}
                id="username"
                items={usernames}
                onChange={(e: CustomEvent) => {
                  field.onChange(e.detail);
                }}
                placeholder="Choose a Username"
                selected={usernames.find(
                  (usernameOption) => usernameOption === username
                )}
                valueFn={(usernameOption: string) => `${usernameOption}`}
              />
            )}
          />
        </Box>

        <Box
          style={{
            marginTop: theme.spacingFunction(50),
            paddingTop: theme.spacingFunction(8),
            paddingBottom: theme.spacingFunction(8),
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button buttonType="secondary" onClick={handleOnClose}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            data-testid="add-connection-pool-button"
            loading={submitInProgress}
            style={{
              marginLeft: theme.spacingFunction(12),
            }}
            type="submit"
          >
            Add Pool
          </Button>
        </Box>
      </form>
    </Drawer>
  );
};
