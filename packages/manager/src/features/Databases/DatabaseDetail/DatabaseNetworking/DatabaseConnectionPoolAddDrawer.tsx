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

  /** Shared ErrorText component that displays formatted error messages below form field components that don't have the errorText property */
  const SharedErrorText = (errorMessage: string | undefined) =>
    errorMessage && (
      <FormHelperText
        error
        role="alert"
        sx={{ marginTop: theme.spacingFunction(4) }}
      >
        {errorMessage}
      </FormHelperText>
    );

  /** Utility function to generate error styles for form field components that can't set them by default */
  const makeErrorStyles = (errorMessage: string | undefined) => {
    return errorMessage
      ? {
          border: `1px solid ${theme.tokens.component.Select.Error.Border}`,
        }
      : undefined;
  };

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

  const poolModes: PoolMode[] = ['transaction', 'session', 'statement'];
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
              placeholder="Enter a pool label"
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
                  data-testid="database-name-select"
                  id="databaseName"
                  items={databaseNames}
                  onChange={(e: CustomEvent) => {
                    field.onChange(e.detail);
                  }}
                  selected={databaseNames.find((name) => name === database)}
                  style={makeErrorStyles(fieldState.error?.message)}
                />
                {SharedErrorText(fieldState.error?.message)}
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
            render={({ field, fieldState }) => (
              <>
                <Select
                  {...field}
                  data-testid="pool-mode-select"
                  id="poolMode"
                  items={poolModes}
                  onChange={(e: CustomEvent) => {
                    field.onChange(e.detail);
                  }}
                  selected={poolModes.find((poolMode) => mode === poolMode)}
                  style={makeErrorStyles(fieldState.error?.message)}
                  valueFn={(poolMode: PoolMode) => {
                    return `${poolMode.charAt(0).toUpperCase()}${poolMode.slice(1)}`;
                  }}
                />
                {SharedErrorText(fieldState.error?.message)}
              </>
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
                data-testid="pool-size-input"
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
            render={({ field, fieldState }) => (
              <>
                <Select
                  {...field}
                  data-testid="username-select"
                  id="username"
                  items={usernames}
                  onChange={(e: CustomEvent) => {
                    field.onChange(e.detail);
                  }}
                  selected={usernames.find(
                    (usernameOption) => usernameOption === username
                  )}
                  style={makeErrorStyles(fieldState.error?.message)}
                  valueFn={(usernameOption: string) => `${usernameOption}`}
                />
                {SharedErrorText(fieldState.error?.message)}
              </>
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
