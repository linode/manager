import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDatabaseEngineConfig, useDatabaseMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Stack, Typography } from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import { createDynamicAdvancedConfigSchema } from '@linode/validation';
import Grid from '@mui/material/Grid';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, get, useFieldArray, useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';

import { Link } from 'src/components/Link';

import {
  ADVANCED_CONFIG_INFO,
  ADVANCED_CONFIG_LEARN_MORE_LINK,
} from '../../constants';
import { CircleProgress } from '../../shared/CircleProgress/CircleProgress';
import { Divider } from '../../shared/Divider/Divider';
import { DatabaseConfigurationItem } from './DatabaseConfigurationItem';
import { DatabaseConfigurationSelect } from './DatabaseConfigurationSelect';
import {
  convertEngineConfigToOptions,
  convertExistingConfigsToArray,
  findConfigItem,
  formatConfigPayload,
  getDefaultConfigValue,
  hasRestartCluster,
} from './utilities';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type {
  Database,
  DatabaseInstance,
  UpdateDatabasePayload,
} from '@linode/api-v4';
import type { ObjectSchema } from 'yup';

interface Props {
  database: Database | DatabaseInstance;
  onClose: () => void;
  open: boolean;
}

interface Configs {
  configs: ConfigurationOption[];
}

export const DatabaseAdvancedConfigurationDrawer = (props: Props) => {
  const { database, onClose, open } = props;
  const { engine, engine_config: existingConfiguration, id } = database;

  const [selectedConfig, setSelectedConfig] =
    useState<ConfigurationOption | null>(null);

  const formContainerRef = React.useRef<HTMLFormElement>(null);
  const { isPending: isUpdating, mutateAsync: updateDatabase } =
    useDatabaseMutation(engine, id);

  const { data: databaseConfig, isLoading } = useDatabaseEngineConfig(
    engine,
    true
  );

  const configurations = convertEngineConfigToOptions(databaseConfig);

  const existingConfigurations = useMemo(
    () => convertExistingConfigsToArray(existingConfiguration, databaseConfig),
    [existingConfiguration, databaseConfig]
  );

  const {
    control,
    formState: { isDirty, errors },
    handleSubmit,
    setError,
    reset,
    watch,
  } = useForm<Configs>({
    defaultValues: { configs: existingConfigurations },
    mode: 'onBlur',
    resolver: yupResolver(
      createDynamicAdvancedConfigSchema(configurations) as ObjectSchema<Configs>
    ),
  });

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: 'configs',
  });

  useEffect(() => {
    if (existingConfigurations.length > 0 || open) {
      reset({ configs: existingConfigurations });
    }
  }, [existingConfigurations, open]);

  const configs = watch('configs');

  const usedConfigs = useMemo(
    () => new Set(fields.map((config) => config.label)),
    [fields]
  );
  const availableConfigurations = configurations.filter(
    (config) => !usedConfigs.has(config.label)
  );

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
      value: getDefaultConfigValue(config),
    });

    setSelectedConfig(null);
  };

  const handleRemoveConfig = (index: number) => {
    remove(index);
  };

  const handleClose = () => {
    reset();
    setSelectedConfig(null);
    onClose();
  };

  const onSubmit: SubmitHandler<Configs> = async (formData) => {
    const payload: UpdateDatabasePayload = {
      engine_config: formatConfigPayload(formData.configs, configurations),
    };
    await updateDatabase(payload)
      .then(() => {
        handleClose();
        enqueueSnackbar('Advanced Configuration settings saved', {
          variant: 'success',
        });
      })
      .catch((errors) => {
        for (const error of errors) {
          setError(error?.field ?? 'root', { message: error.reason });
        }
        scrollErrorIntoViewV2(formContainerRef);
      });
  };

  return (
    <Drawer onClose={handleClose} open={open} title="Advanced Configuration">
      <form onSubmit={handleSubmit(onSubmit)} ref={formContainerRef}>
        {errors.root?.message && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16, marginTop: Spacing.S16 }}
            type="error"
          >
            {errors.root.message}
          </NotificationBanner>
        )}
        <Typography>
          Advanced parameters to configure your database cluster.
        </Typography>
        <Link to={ADVANCED_CONFIG_LEARN_MORE_LINK}>Learn more.</Link>

        <NotificationBanner
          style={{ marginBottom: Spacing.S8, marginTop: Spacing.S24 }}
          type="info"
        >
          <Typography>{ADVANCED_CONFIG_INFO}</Typography>
        </NotificationBanner>

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
              data-testid="add-config"
              disabled={!selectedConfig}
              onClick={() => handleAddConfiguration(selectedConfig)}
              style={{ minWidth: 'auto', width: '70px' }}
              title="Add"
              variant="primary"
            >
              Add
            </Button>
          </Grid>
        </Grid>
        <Divider marginBottom={Spacing.S20} marginTop={Spacing.S24} />
        {isLoading && (
          <Stack alignItems="center" height="100%" justifyContent="center">
            <CircleProgress
              size="small"
              style={{ flex: 'none', height: 'auto', margin: 0 }}
            />
          </Stack>
        )}
        {!isLoading && configs.length === 0 && (
          <Typography align="center">
            No advanced configurations have been added.
          </Typography>
        )}
        {configs.map((config, index) => (
          <Controller
            control={control}
            key={config.label}
            name={`configs.${index}.value`}
            render={({ field, fieldState }) => {
              const configName =
                config.category === 'other'
                  ? `engine_config.${config.label}`
                  : `engine_config.${config.category}.${config.label}`;
              return (
                <DatabaseConfigurationItem
                  configItem={config}
                  errorText={
                    fieldState.error?.message ||
                    get(errors, configName)?.message
                  }
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  onRemove={() => handleRemoveConfig(index)}
                />
              );
            }}
          />
        ))}
        <Divider marginBottom={Spacing.S20} marginTop={Spacing.S24} />
        <ActionsPanel
          primaryButtonProps={{
            disabled: !isDirty,
            label: hasRestartCluster(configs, existingConfigurations),
            loading: isUpdating,
            type: 'submit',
            title: 'Save',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleClose,
            title: 'Cancel',
          }}
        />
      </form>
    </Drawer>
  );
};
