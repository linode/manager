import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Paper, TextField, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { Drawer } from 'src/components/Drawer';
import {
  useAlertNotificationChannelsQuery,
  useCreateAlertDefinition,
} from 'src/queries/cloudpulse/alerts';

import { AlertResources } from '../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../Utils/utils';
import { MetricCriteriaField } from './Criteria/MetricCriteria';
import { TriggerConditions } from './Criteria/TriggerConditions';
import { CloudPulseAlertSeveritySelect } from './GeneralInformation/AlertSeveritySelect';
// import { EngineOption } from './GeneralInformation/EngineOption';
// import { CloudPulseRegionSelect } from './GeneralInformation/RegionSelect';
// import { CloudPulseMultiResourceSelect } from './GeneralInformation/ResourceMultiSelect';
import { CloudPulseServiceSelect } from './GeneralInformation/ServiceTypeSelect';
import { AddChannelListing } from './NotificationChannel/AddChannelListing';
import { AddNotificationChannel } from './NotificationChannel/AddNotificationChannel';
import { CreateAlertDefinitionFormSchema } from './schemas';
import { filterFormValues } from './utilities';

import type {
  CreateAlertDefinitionForm,
  MetricCriteriaForm,
  TriggerConditionForm,
} from './types';
import type { NotificationChannel } from '@linode/api-v4/lib/cloudpulse/types';
import type { ObjectSchema } from 'yup';

const triggerConditionInitialValues: TriggerConditionForm = {
  criteria_condition: 'ALL',
  evaluation_period_seconds: null,
  polling_interval_seconds: null,
  trigger_occurrences: 0,
};
const criteriaInitialValues: MetricCriteriaForm = {
  aggregation_type: null,
  dimension_filters: [],
  metric: null,
  operator: null,
  threshold: 0,
};
const initialValues: CreateAlertDefinitionForm = {
  channel_ids: [],
  engineType: null,
  entity_ids: [],
  label: '',
  region: '',
  rule_criteria: {
    rules: [criteriaInitialValues],
  },
  serviceType: null,
  severity: null,
  tags: [''],
  trigger_conditions: triggerConditionInitialValues,
};

const overrides = [
  {
    label: 'Definitions',
    linkTo: '/monitor/alerts/definitions',
    position: 1,
  },
  {
    label: 'Details',
    linkTo: `/monitor/alerts/definitions/create`,
    position: 2,
  },
];
export const CreateAlertDefinition = () => {
  const history = useHistory();
  const alertCreateExit = () => history.push('/monitor/alerts/definitions');

  const formMethods = useForm<CreateAlertDefinitionForm>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: yupResolver(
      CreateAlertDefinitionFormSchema as ObjectSchema<CreateAlertDefinitionForm>
    ),
  });

  const {
    control,
    formState,
    getValues,
    handleSubmit,
    setError,
    setValue,
  } = formMethods;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createAlert } = useCreateAlertDefinition(
    getValues('serviceType')!
  );

  const theme = useTheme();

  /**
   * The maxScrapeInterval variable will be required for the Trigger Conditions part of the Critieria section.
   */
  const [maxScrapeInterval, setMaxScrapeInterval] = React.useState<number>(0);

  const serviceTypeWatcher = useWatch({ control, name: 'serviceType' });
  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAlert(filterFormValues(values));
      enqueueSnackbar('Alert successfully created', {
        variant: 'success',
      });
      alertCreateExit();
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          enqueueSnackbar(`Alert failed: ${error.reason}`, {
            variant: 'error',
          });
          setError('root', { message: error.reason });
        }
      }
    }
  });
  const {
    data: notificationData,
    isError: notificationChannelsError,
    isLoading: notificationChannelsLoading,
  } = useAlertNotificationChannelsQuery();
  React.useEffect(() => {
    if (!serviceTypeWatcher) {
      setValue('entity_ids', [], { shouldValidate: true });
    }
  }, [serviceTypeWatcher, setValue]);
  const notificationChannelWatcher = useWatch({ control, name: 'channel_ids' });

  const onChangeNotifications = (notifications: NotificationChannel[]) => {
    const notificationTemplateList = notifications.map(
      (notification) => notification.id
    );
    setValue('channel_ids', notificationTemplateList);
  };
  const [openAddNotification, setOpenAddNotification] = React.useState(false);

  const onSubmitAddNotification = (notificationId: number) => {
    setValue('channel_ids', [...notificationChannelWatcher, notificationId], {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setOpenAddNotification(false);
  };

  const handleResourcesSelection = (resourceIds: string[]) => {
    setValue('entity_ids', resourceIds, { shouldValidate: true });
  };

  const notifications = React.useMemo(() => {
    return (
      notificationData?.filter(
        (notification) => !notificationChannelWatcher.includes(notification.id)
      ) ?? []
    );
  }, [notificationChannelWatcher, notificationData]);

  const selectedNotifications = React.useMemo(() => {
    return (
      notificationData?.filter((notification) =>
        notificationChannelWatcher.includes(notification.id)
      ) ?? []
    );
  }, [notificationChannelWatcher, notificationData]);

  const onExitNotifications = () => {
    setOpenAddNotification(false);
  };

  const onAddNotifications = () => {
    setOpenAddNotification(true);
  };

  return (
    <Paper sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}>
      <Breadcrumb crumbOverrides={overrides} pathname="/Definitions/Create" />
      <FormProvider {...formMethods}>
        <form onSubmit={onSubmit}>
          <Typography marginTop={2} variant="h2">
            1. General Information
          </Typography>
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                data-testid="alert-name"
                errorText={fieldState.error?.message}
                label="Name"
                name="label"
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Enter Name"
                value={field.value ?? ''}
              />
            )}
            control={control}
            name="label"
          />
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                label="Description"
                name="description"
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.value)}
                optional
                placeholder="Enter Description"
                value={field.value ?? ''}
              />
            )}
            control={control}
            name="description"
          />
          <CloudPulseServiceSelect name="serviceType" />
          {/* <CloudPulseServiceSelect name="serviceType" />
          {serviceTypeWatcher === 'dbaas' && <EngineOption name="engineType" />}
          <CloudPulseRegionSelect name="region" />
          <CloudPulseMultiResourceSelect
            engine={useWatch({ control, name: 'engineType' })}
            name="entity_ids"
            region={useWatch({ control, name: 'region' })}
            serviceType={serviceTypeWatcher}
          /> */}
          <CloudPulseAlertSeveritySelect name="severity" />
          <Controller
            render={({ field, fieldState }) => (
              <Box mt={3}>
                <Box
                  alignItems="center"
                  display="flex"
                  gap={2}
                  sx={{ marginBottom: 1 }}
                >
                  <Typography variant="h2">2. Resources</Typography>
                  {formState.isSubmitted && fieldState.error && (
                    <Typography color="#d63c42" variant="body2">
                      ({fieldState.error.message})
                    </Typography>
                  )}
                </Box>
                <Box sx={{ ...getAlertBoxStyles(theme), overflow: 'auto' }}>
                  <AlertResources
                    handleResourcesSelection={handleResourcesSelection}
                    isSelectionsNeeded
                    resourceIds={field.value} // Controlled field
                    serviceType={serviceTypeWatcher!}
                  />
                </Box>
              </Box>
            )}
            control={control}
            name="entity_ids"
          />
          <MetricCriteriaField
            setMaxInterval={(interval: number) =>
              setMaxScrapeInterval(interval)
            }
            name="rule_criteria.rules"
            serviceType={serviceTypeWatcher!}
          />
          <TriggerConditions
            maxScrapingInterval={maxScrapeInterval}
            name="trigger_conditions"
          />
          <AddChannelListing
            notifications={selectedNotifications}
            onChangeNotifications={onChangeNotifications}
            onClickAddNotification={onAddNotifications}
          />
          <ActionsPanel
            primaryButtonProps={{
              label: 'Submit',
              loading: formState.isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: alertCreateExit,
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
          {openAddNotification && (
            <Drawer
              onClose={onExitNotifications}
              open={openAddNotification}
              title="Add Notification Channel"
            >
              <AddNotificationChannel
                isNotificationChannelsError={notificationChannelsError}
                isNotificationChannelsLoading={notificationChannelsLoading}
                onCancel={onExitNotifications}
                onSubmitAddNotification={onSubmitAddNotification}
                templateData={notifications}
              />
            </Drawer>
          )}
        </form>
      </FormProvider>
    </Paper>
  );
};
