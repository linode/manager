import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateDatabaseConnectionPoolMutation } from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Checkbox,
  Drawer,
  FormControlLabel,
  Notice,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { createDatabaseConnectionPoolSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { poolModeOptions } from 'src/features/Databases/constants';

import { MANAGE_CONNECTION_POOLS_LEARN_MORE_LINK } from '../../constants';

import type { ConnectionPool } from '@linode/api-v4';

interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
}

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
      username: null,
    },
    mode: 'onBlur',
    resolver: yupResolver(createDatabaseConnectionPoolSchema),
  });

  const [mode] = useWatch({
    control,
    name: ['mode'],
  });

  const handleOnClose = () => {
    onClose();
    reset();
    resetMutation?.();
  };

  const onSubmit = async (values: ConnectionPool) => {
    const payload = {
      ...values,
      username: values.username,
    };

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
        resources.{' '}
        <Link to={MANAGE_CONNECTION_POOLS_LEARN_MORE_LINK}>Learn more.</Link>
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
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
              <>
                <TextField
                  {...field}
                  disabled={field.value === null}
                  errorText={fieldState.error?.message}
                  id="username"
                  label="Username"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  onClear={() => field.onChange('')}
                  placeholder="akmadmin"
                  value={field.value === null ? '' : field.value}
                />
                <FormControlLabel
                  checked={field.value === null}
                  control={
                    <Checkbox
                      name="username"
                      onChange={() =>
                        field.onChange(field.value === null ? '' : null)
                      }
                    />
                  }
                  data-qa-checkbox="reuseInboundUser"
                  label="Reuse inbound user"
                />
              </>
            )}
          />
        </Stack>

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
