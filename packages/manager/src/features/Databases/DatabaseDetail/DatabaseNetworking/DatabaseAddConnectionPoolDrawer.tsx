import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Checkbox,
  FormError,
  FormField,
  FormLabel,
  NotificationBanner,
  TextField,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateDatabaseConnectionPoolMutation } from '@linode/queries';
import { Autocomplete, FormControlLabel } from '@linode/ui';
import { createDatabaseConnectionPoolSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { poolModeOptions } from 'src/features/Databases/constants';

import { MANAGE_CONNECTION_POOLS_LEARN_MORE_LINK } from '../../constants';
import { Drawer } from '../../shared/Drawer';
import { DrawerActions } from '../../shared/DrawerActions';
import { Stack } from '../../shared/Stack/Stack';

import type { ConnectionPool } from '@linode/api-v4';

interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
}

export const DatabaseAddConnectionPoolDrawer = (props: Props) => {
  const { databaseId, onClose, open } = props;

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
    clearErrors,
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
      toast.open({
        text: 'Connection Pool added successfully.',
        type: 'success',
      });
      handleOnClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <Drawer onClose={handleOnClose} open={open}>
      <span slot="header">Add a New Connection Pool</span>
      <div slot="body">
        {errors.root?.message && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={errors.root.message}
            type="error"
          />
        )}
        <p style={{ margin: 0 }}>
          Add a PgBouncer connection pool to minimize the use of your server
          resources.{' '}
          <Link to={MANAGE_CONNECTION_POOLS_LEARN_MORE_LINK}>Learn more.</Link>
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <Controller
              control={control}
              name="label"
              render={({ field, fieldState }) => (
                <FormField
                  error={Boolean(fieldState.error)}
                  labelPosition="top"
                  onBlur={field.onBlur}
                  style={{ maxWidth: '416px' }}
                >
                  <FormLabel htmlFor="poolLabel" slot="label">
                    Pool Label
                  </FormLabel>
                  <TextField
                    {...field}
                    id="poolLabel"
                    onChange={field.onChange}
                    placeholder="Enter a pool label"
                  />
                  <FormError slot="error">
                    {fieldState.error?.message}
                  </FormError>
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="database"
              render={({ field, fieldState }) => (
                <FormField
                  error={Boolean(fieldState.error)}
                  labelPosition="top"
                  onBlur={field.onBlur}
                  style={{ paddingBottom: Spacing.S8, maxWidth: '416px' }}
                >
                  <FormLabel htmlFor="databaseName" slot="label">
                    Database Name
                  </FormLabel>
                  <TextField
                    {...field}
                    id="databaseName"
                    onChange={field.onChange}
                    placeholder="defaultdb"
                  />
                  <FormError slot="error">
                    {fieldState.error?.message}
                  </FormError>
                </FormField>
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
                  disablePortal={false} // Portal must be enabled for the popper to open in a CDS Drawer
                  errorText={fieldState.error?.message}
                  id="poolMode"
                  onChange={(e, option) => {
                    field.onChange(option.value);
                  }}
                  options={poolModeOptions}
                  sx={{ marginBottom: Spacing.S16 }}
                  value={poolModeOptions.find(
                    (option) => option.value === mode
                  )}
                />
              )}
            />

            <Controller
              control={control}
              name="size"
              render={({ field, fieldState }) => (
                <FormField
                  error={Boolean(fieldState.error)}
                  labelPosition="top"
                  onBlur={field.onBlur}
                >
                  <FormLabel htmlFor="poolSize" slot="label">
                    Pool Size
                  </FormLabel>
                  <TextField
                    id="poolSize"
                    {...field}
                    data-testid="pool-size-input"
                    onChange={(e) => {
                      const raw =
                        (e.currentTarget as EventTarget & { value?: string })
                          ?.value ?? '';
                      field.onChange(raw.length > 0 ? Number(raw) : raw);
                    }}
                    style={{ width: '220px' }}
                    value={String(field.value ?? '')}
                  />
                  <FormError slot="error">
                    {fieldState.error?.message}
                  </FormError>
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field, fieldState }) => (
                <>
                  <FormField
                    error={Boolean(fieldState.error)}
                    labelPosition="top"
                    onBlur={field.onBlur}
                    style={{ paddingBottom: 0, maxWidth: '416px' }}
                  >
                    <FormLabel htmlFor="username" slot="label">
                      Username
                    </FormLabel>
                    <TextField
                      {...field}
                      disabled={field.value === null}
                      id="username"
                      onChange={field.onChange}
                      placeholder={field.value === null ? '' : 'akmadmin'}
                      value={field.value ?? ''}
                    />
                    <FormError slot="error">
                      {fieldState.error?.message}
                    </FormError>
                  </FormField>
                  <FormControlLabel
                    checked={field.value === null}
                    control={
                      <Checkbox
                        data-testid="database-reuse-inbound-user-checkbox"
                        name="username"
                        onChange={() => {
                          if (field.value === null) {
                            field.onChange('');
                          } else {
                            field.onChange(null);
                            clearErrors('username');
                          }
                        }}
                      />
                    }
                    data-qa-checkbox="reuseInboundUser"
                    label="Reuse inbound user"
                    sx={{
                      margin: '8px 0',
                    }}
                  />
                </>
              )}
            />
          </Stack>
          <DrawerActions>
            <Button onClick={handleOnClose} variant="secondary">
              Cancel
            </Button>
            <Button
              data-testid="add-connection-pool-button"
              processing={submitInProgress}
              type="submit"
              variant="primary"
            >
              Add Pool
            </Button>
          </DrawerActions>
        </form>
      </div>
    </Drawer>
  );
};
