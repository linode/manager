import { Button, ActionsPanel, Divider, Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import {
  useDatabaseAdvancedConfigurationQuery,
  useDatabaseMutation,
} from 'src/queries/databases/databases';

import { convertExistingConfigsToArray } from '../../utilities';
import { DatabaseConfigurationItem } from './DatabaseConfigurationItem';
import { DatabaseConfigurationSelect } from './DatabaseConfigurationSelect';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type {
  ConfigCategoryValues,
  ConfigValue,
  Database,
  DatabaseInstance,
  UpdateDatabasePayload,
} from '@linode/api-v4';

interface Props {
  database: Database | DatabaseInstance;
  onClose: () => void;
  open: boolean;
}

export const DatabaseAdvancedConfigurationDrawer = (props: Props) => {
  const { database, onClose, open } = props;
  const { engine, engine_config: enginConfigurationOptions, id } = database;

  const [
    selectedConfig,
    setSelectedConfig,
  ] = useState<ConfigurationOption | null>(null);
  const {
    error: updateDatabaseError,
    isPending: isUpdating,
    mutateAsync: updateDatabase,
  } = useDatabaseMutation(engine, id);

  const { data: allConfigs } = useDatabaseAdvancedConfigurationQuery(
    engine,
    true
  );

  const existingConfigsArray = convertExistingConfigsToArray(
    enginConfigurationOptions,
    allConfigs
  );

  const hasRestartCluster = existingConfigsArray.find(
    (item) => item.restart_cluster
  );

  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        existingConfigsArray.map((opt) => [opt.label, opt.value ?? ''])
      ),
    [existingConfigsArray]
  );

  const {
    control,
    formState: { dirtyFields, isDirty },
    handleSubmit,
    reset,
  } = useForm<{ [key: string]: ConfigValue | undefined }>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (allConfigs) {
      reset(initialValues);
    }
  }, [allConfigs]);

  const onSubmit = async (formData: ConfigCategoryValues) => {
    if (!dirtyFields) {
      return;
    }

    const payload: UpdateDatabasePayload = {
      // TODO: format payload
      engine_config: formData,
    };
    await updateDatabase(payload).then(() => {
      onClose();
      enqueueSnackbar('Advanced Configuration settings saved', {
        variant: 'success',
      });
    });
  };
  return (
    <Drawer onClose={onClose} open={open} title="Advanced Configuration">
      {Boolean(updateDatabaseError) && (
        <Notice spacingBottom={16} spacingTop={16} variant="error">
          {updateDatabaseError?.[0].reason}
        </Notice>
      )}
      <Typography>
        Advanced parameters to configure your database cluster.
      </Typography>
      <Link to="">Learn more.</Link>

      <Notice important sx={{ mb: 1, mt: 3 }} variant="info">
        <Typography>
          There is no way to reset advanced configuration options to default.
          Options that you add cannot be removed. Changing or adding some
          options causes the service to restart.
        </Typography>
      </Notice>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          alignItems={'end'}
          container
          justifyContent="space-between"
          size={12}
        >
          <Grid size={9}>
            <DatabaseConfigurationSelect
              configurations={[]}
              errorText={undefined}
              label={selectedConfig?.label ?? ''}
              onChange={(config) => setSelectedConfig(config)}
            />
          </Grid>
          <Grid size={2}>
            <Button
              buttonType="primary"
              disabled={!selectedConfig}
              sx={{ minWidth: 'auto', width: '70px' }}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        <Divider spacingBottom={20} spacingTop={24} />
        {existingConfigsArray.length > 0 &&
          existingConfigsArray.map((option) => (
            <Controller
              render={({ field, fieldState }) => (
                <DatabaseConfigurationItem
                  configItem={option}
                  configValue={field.value}
                  engine={engine}
                  errorText={fieldState.error?.message}
                  onChange={field.onChange}
                />
              )}
              control={control}
              key={option.label}
              name={option.label}
            />
          ))}
        {existingConfigsArray.length === 0 && (
          <Typography align="center">
            No advanced configurations have been added.
          </Typography>
        )}
        <Divider spacingBottom={20} spacingTop={24} />
        <ActionsPanel
          primaryButtonProps={{
            disabled: !isDirty,
            label: hasRestartCluster ? 'Save and Restart Service' : 'Save',
            loading: isUpdating,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
