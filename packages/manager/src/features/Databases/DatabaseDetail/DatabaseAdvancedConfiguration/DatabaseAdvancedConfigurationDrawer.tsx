import { yupResolver } from '@hookform/resolvers/yup';
import {
  ActionsPanel,
  Button,
  Divider,
  Drawer,
  Notice,
  Typography,
} from '@linode/ui';
import { createDynamicAdvancedConfigSchema } from '@linode/validation';
import Grid from '@mui/material/Grid2';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import {
  useDatabaseEngineConfig,
  useDatabaseMutation,
} from 'src/queries/databases/databases';

import {
  convertEngineConfigToOptions,
  convertExistingConfigsToArray,
  findConfigItem,
  formatConfigPayload,
  isConfigBoolean,
  isConfigStringWithEnum,
} from '../../utilities';
import { DatabaseConfigurationItem } from './DatabaseConfigurationItem';
import { DatabaseConfigurationSelect } from './DatabaseConfigurationSelect';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type {
  Database,
  DatabaseInstance,
  UpdateDatabasePayload,
} from '@linode/api-v4';
import type { SubmitHandler } from 'react-hook-form';
import type { ObjectSchema } from 'yup';

interface Props {
  database: Database | DatabaseInstance;
  onClose: () => void;
  open: boolean;
}

interface FormValues {
  configs: ConfigurationOption[];
}

export const DatabaseAdvancedConfigurationDrawer = (props: Props) => {
  const { database, onClose, open } = props;
  const { engine, engine_config: existingConfigurations, id } = database;

  const [
    selectedConfig,
    setSelectedConfig,
  ] = useState<ConfigurationOption | null>(null);

  const {
    error: updateDatabaseError,
    isPending: isUpdating,
    mutateAsync: updateDatabase,
  } = useDatabaseMutation(engine, id);

  const { data: databaseConfig } = useDatabaseEngineConfig(engine, true);

  const configurations = convertEngineConfigToOptions(databaseConfig);

  const existingConfigsArray = convertExistingConfigsToArray(
    existingConfigurations,
    databaseConfig
  );

  const initialValues = Object.fromEntries(
    existingConfigsArray.map((opt) => [opt.label, opt.value ?? ''])
  );

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
    watch,
  } = useForm<FormValues>({
    defaultValues: { configs: existingConfigsArray },
    resolver: yupResolver(
      createDynamicAdvancedConfigSchema(
        configurations
      ) as ObjectSchema<FormValues>
    ),
  });

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: 'configs',
  });

  const configs = watch('configs');

  useEffect(() => {
    if (databaseConfig) {
      reset({ configs: existingConfigsArray });
    }
  }, [databaseConfig, onClose]);

  const usedConfigs = useMemo(
    () => new Set(fields.map((config) => config.label)),
    [fields]
  );
  const availableConfigurations = configurations.filter(
    (config) => !usedConfigs.has(config.label)
  );

  const hasRestartCluster = fields.some((item) => item.restart_cluster);

  const handleAddConfiguration = (config: ConfigurationOption | null) => {
    if (!config || usedConfigs.has(config.label)) {
      return;
    }
    const item = findConfigItem(databaseConfig, String(config.label));
    prepend({
      ...item,
      category: config?.category ?? '',
      isNew: true,
      label: config?.label ?? '',
      value: isConfigBoolean(config)
        ? false
        : isConfigStringWithEnum(config)
        ? config.enum?.[0] ?? ''
        : '',
    });

    setSelectedConfig(null);
  };

  const handleRemoveConfig = (index: number) => {
    remove(index);
    reset(watch(), { keepDirty: true });
  };

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    const payload: UpdateDatabasePayload = {
      engine_config: formatConfigPayload(formData.configs, configurations),
    };
    await updateDatabase(payload).then(() => {
      onClose();
      enqueueSnackbar('Advanced Configuration settings saved', {
        variant: 'success',
      });
    });
  };

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Advanced Configuration"
    >
      {Boolean(updateDatabaseError) && (
        <Notice spacingBottom={16} spacingTop={16} variant="error">
          {updateDatabaseError?.[0].reason}
        </Notice>
      )}
      <Typography>
        Advanced parameters to configure your database cluster.
      </Typography>
      <Link to="https://techdocs.akamai.com/cloud-computing/docs/advanced-configuration-parameters">
        Learn more.
      </Link>

      <Notice important sx={{ mb: 1, mt: 3 }} variant="info">
        <Typography>
          There is no way to reset advanced configuration options to default.
          Options that you add cannot be removed. Changing or adding some
          options causes the service to restart.
        </Typography>
      </Notice>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          alignItems="end"
          container
          justifyContent="space-between"
          size={12}
        >
          <Grid size={9}>
            <DatabaseConfigurationSelect
              configurations={availableConfigurations}
              errorText={undefined}
              label={selectedConfig?.label ?? ''}
              onChange={(config) => setSelectedConfig(config)}
            />
          </Grid>
          <Grid size={2}>
            <Button
              buttonType="primary"
              disabled={!selectedConfig}
              onClick={() => handleAddConfiguration(selectedConfig)}
              sx={{ minWidth: 'auto', width: '70px' }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
        <Divider spacingBottom={20} spacingTop={24} />
        {configs.map((config, index) => (
          <Controller
            render={({ field, fieldState }) => {
              return (
                <DatabaseConfigurationItem
                  configItem={config}
                  engine={engine}
                  errorText={fieldState.error?.message}
                  onChange={field.onChange}
                  onRemove={() => handleRemoveConfig(index)}
                />
              );
            }}
            control={control}
            key={config.label}
            name={`configs.${index}.value`}
          />
        ))}
        {configs.length === 0 && (
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
