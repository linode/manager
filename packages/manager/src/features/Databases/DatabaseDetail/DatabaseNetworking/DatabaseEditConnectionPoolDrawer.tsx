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
import { useUpdateDatabaseConnectionPoolMutation } from '@linode/queries';
import { Autocomplete, FormControlLabel } from '@linode/ui';
import { updateDatabaseConnectionPoolSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { poolModeOptions } from 'src/features/Databases/constants';

import { Drawer } from '../../shared/Drawer';
import { DrawerActions } from '../../shared/DrawerActions';
import { Stack } from '../../shared/Stack/Stack';

import type { ConnectionPool } from '@linode/api-v4';

interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
  pool: ConnectionPool;
}

interface EditConnectionPool extends Omit<ConnectionPool, 'label'> {
  label?: string;
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
    clearErrors,
  } = useForm<EditConnectionPool>({
    defaultValues: {
      ...pool,
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
    };

    try {
      await updateDatabaseConnectionPool(payload);
      toast.open({
        text: `Connection Pool ${label} edited successfully.`,
        type: 'success',
      });
      handleOnClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const [mode] = useWatch({
    control,
    name: ['mode'],
  });

  return (
    <Drawer onClose={handleOnClose} open={open}>
      <span slot="header">Edit Connection Pool</span>
      <div slot="body">
        {errors.root?.message && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={errors.root.message}
            type="error"
          />
        )}
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
                    disabled
                    id="poolLabel"
                    placeholder="Enter a pool label"
                    value={field.value}
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
                  disablePortal={false} // Disable the portal to ensure the popper is rendered within the CDS Drawer
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
                    style={{ maxWidth: '416px' }}
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
              data-testid="save-connection-pool-button"
              disabled={!isDirty}
              processing={submitInProgress}
              type="submit"
              variant="primary"
            >
              Save
            </Button>
          </DrawerActions>
        </form>
      </div>
    </Drawer>
  );
};
