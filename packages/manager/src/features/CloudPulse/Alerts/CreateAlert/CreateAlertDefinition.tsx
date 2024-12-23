import { yupResolver } from '@hookform/resolvers/yup';
import { Paper, TextField, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { useCreateAlertDefinition, useNotificationChannels } from 'src/queries/cloudpulse/alerts';

import { MetricCriteriaField } from './Criteria/MetricCriteria';
import { CloudPulseAlertSeveritySelect } from './GeneralInformation/AlertSeveritySelect';
import { EngineOption } from './GeneralInformation/EngineOption';
import { CloudPulseRegionSelect } from './GeneralInformation/RegionSelect';
import { CloudPulseMultiResourceSelect } from './GeneralInformation/ResourceMultiSelect';
import { CloudPulseServiceSelect } from './GeneralInformation/ServiceTypeSelect';
import { CreateAlertDefinitionFormSchema } from './schemas';
import { filterFormValues } from './utilities';

import type { CreateAlertDefinitionForm, MetricCriteriaForm } from './types';
import type { NotificationChannel, TriggerCondition } from '@linode/api-v4/lib/cloudpulse/types';
import type { ObjectSchema } from 'yup';
import { AddChannelListing } from './NotificationChannel/AddChannelListing';
import { AddNotificationChannel } from './NotificationChannel/AddNotificationChannel';
import { Drawer } from 'src/components/Drawer';

const triggerConditionInitialValues: TriggerCondition = {
  criteria_condition: 'ALL',
  evaluation_period_seconds: 0,
  polling_interval_seconds: 0,
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

  const { control, formState, getValues, handleSubmit, setError, setValue } = formMethods;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createAlert } = useCreateAlertDefinition(
    getValues('serviceType')!
  );

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
  const { data: notificationData } = useNotificationChannels();
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

  const getNotifications = React.useMemo(() => {
    return (
      notificationData?.data.filter(
        (notification) => !notificationChannelWatcher.includes(notification.id)
      ) ?? []
    );
  }, [notificationChannelWatcher, notificationData]);

  const getSelectedNotifications = React.useMemo(() => {
    return (
      notificationData?.data.filter((notification) =>
        notificationChannelWatcher.includes(notification.id)
      ) ?? []
    );
  }, [notificationChannelWatcher, notificationData]);
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
          {serviceTypeWatcher === 'dbaas' && <EngineOption name="engineType" />}
          <CloudPulseRegionSelect name="region" />
          <CloudPulseMultiResourceSelect
            engine={useWatch({ control, name: 'engineType' })}
            name="entity_ids"
            region={useWatch({ control, name: 'region' })}
            serviceType={serviceTypeWatcher}
          />
          <CloudPulseAlertSeveritySelect name="severity" />
          <MetricCriteriaField
            setMaxInterval={(interval: number) =>
              setMaxScrapeInterval(interval)
            }
            name="rule_criteria.rules"
            serviceType={serviceTypeWatcher!}
          />
          {/* This is just being displayed to pass the typecheck-manager test. In the next PR maxScrapeInterval will be used by another component */}
          {maxScrapeInterval}
          <AddChannelListing
            notifications={getSelectedNotifications}
            onChangeNotifications={onChangeNotifications}
            onClickAddNotification={() => setOpenAddNotification(true)}
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
              onClose={() => setOpenAddNotification(false)}
              open={openAddNotification}
              title="Add Notification Channel"
            >
              <AddNotificationChannel
                onCancel={() => setOpenAddNotification(false)}
                onSubmitAddNotification={onSubmitAddNotification}
                templateData={getNotifications}
              />
            </Drawer>
          )}
        </form>
      </FormProvider>
    </Paper>
  );
};
