import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from '@linode/api-v4';
import { Paper, TextField, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useCreateAlertDefinition } from 'src/queries/cloudpulse/alerts';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import { MetricCriteriaField } from './Criteria/MetricCriteria';
import { TriggerConditions } from './Criteria/TriggerConditions';
import { CloudPulseAlertSeveritySelect } from './GeneralInformation/AlertSeveritySelect';
import { CloudPulseServiceSelect } from './GeneralInformation/ServiceTypeSelect';
import { AddChannelListing } from './NotificationChannels/AddChannelListing';
import { CloudPulseModifyAlertResources } from './Resources/CloudPulseModifyAlertResources';
import { CreateAlertDefinitionFormSchema } from './schemas';
import { filterFormValues } from './utilities';

import type {
  CreateAlertDefinitionForm,
  MetricCriteriaForm,
  TriggerConditionForm,
} from './types';
import type { ObjectSchema } from 'yup';

const triggerConditionInitialValues: TriggerConditionForm = {
  criteria_condition: 'ALL',
  evaluation_period_seconds: null,
  polling_interval_seconds: null,
  trigger_occurrences: 0,
};
const criteriaInitialValues: MetricCriteriaForm = {
  aggregate_function: null,
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
    linkTo: '/alerts/definitions',
    position: 1,
  },
  {
    label: 'Details',
    linkTo: `/alerts/definitions/create`,
    position: 2,
  },
];
export const CreateAlertDefinition = () => {
  const history = useHistory();
  const alertCreateExit = () => history.push('/alerts/definitions');
  const formRef = React.useRef<HTMLFormElement>(null);

  const formMethods = useForm<CreateAlertDefinitionForm>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: yupResolver(
      CreateAlertDefinitionFormSchema as ObjectSchema<CreateAlertDefinitionForm>
    ),
  });

  const {
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    setError,
  } = formMethods;

  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createAlert } = useCreateAlertDefinition(
    getValues('serviceType')!
  );

  const serviceTypeWatcher = useWatch({ control, name: 'serviceType' });

  const [maxScrapeInterval, setMaxScrapeInterval] = React.useState<number>(0);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAlert(filterFormValues(values));
      enqueueSnackbar('Alert successfully created', {
        variant: 'success',
      });
      alertCreateExit();
    } catch (errors) {
      for (const error of errors) {
        scrollErrorIntoViewV2(formRef);
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

  React.useEffect(() => {
    if (!isEmpty(errors)) {
      scrollErrorIntoView(undefined, { behavior: 'smooth' });
    }
  }, [errors]);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Create an Alert" />
      <Paper sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}>
        <Breadcrumb crumbOverrides={overrides} pathname="/Definitions/Create" />
        <FormProvider {...formMethods}>
          <form onSubmit={onSubmit} ref={formRef}>
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
                  placeholder="Enter a Name"
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
                  placeholder="Enter a Description"
                  value={field.value ?? ''}
                />
              )}
              control={control}
              name="description"
            />
            <CloudPulseServiceSelect isDisabled={false} name="serviceType" />
            <CloudPulseAlertSeveritySelect name="severity" />
            <CloudPulseModifyAlertResources name="entity_ids" />
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
            <AddChannelListing name="channel_ids" />
            <ActionsPanel
              primaryButtonProps={{
                label: 'Submit',
                loading: isSubmitting,
                type: 'submit',
              }}
              secondaryButtonProps={{
                label: 'Cancel',
                onClick: alertCreateExit,
              }}
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
            />
          </form>
        </FormProvider>
      </Paper>
    </React.Fragment>
  );
};
