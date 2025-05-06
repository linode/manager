import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from '@linode/api-v4';
import { ActionsPanel, Paper, TextField, Typography } from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useFlags } from 'src/hooks/useFlags';
import { useCreateAlertDefinition } from 'src/queries/cloudpulse/alerts';

import {
  CREATE_ALERT_ERROR_FIELD_MAP,
  CREATE_ALERT_SUCCESS_MESSAGE,
  MULTILINE_ERROR_SEPARATOR,
  SINGLELINE_ERROR_SEPARATOR,
} from '../constants';
import {
  getSchemaWithEntityIdValidation,
  handleMultipleError,
} from '../Utils/utils';
import { MetricCriteriaField } from './Criteria/MetricCriteria';
import { TriggerConditions } from './Criteria/TriggerConditions';
import { AlertEntityGroupingSelect } from './GeneralInformation/AlertEntityGroupingSelect';
import { CloudPulseAlertSeveritySelect } from './GeneralInformation/AlertSeveritySelect';
import { CloudPulseServiceSelect } from './GeneralInformation/ServiceTypeSelect';
import { AddChannelListing } from './NotificationChannels/AddChannelListing';
import { CloudPulseModifyAlertRegions } from './Regions/CloudPulseModifyAlertRegions';
import { CloudPulseModifyAlertResources } from './Resources/CloudPulseModifyAlertResources';
import { alertDefinitionFormSchema } from './schemas';
import { filterFormValues } from './utilities';

import type {
  CreateAlertDefinitionForm,
  MetricCriteriaForm,
  TriggerConditionForm,
} from './types';
import type { APIError } from '@linode/api-v4';

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
  entity_ids: [],
  label: '',
  rule_criteria: {
    rules: [criteriaInitialValues],
  },
  serviceType: null,
  severity: null,
  tags: [''],
  trigger_conditions: triggerConditionInitialValues,
  type: 'user',
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
  const flags = useFlags();

  // Default resolver
  const [validationSchema, setValidationSchema] = React.useState(
    getSchemaWithEntityIdValidation({
      aclpAlertServiceTypeConfig: flags.aclpAlertServiceTypeConfig ?? [],
      baseSchema: alertDefinitionFormSchema,
      serviceTypeObj: null,
    })
  );

  const formMethods = useForm<CreateAlertDefinitionForm>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
  });
  const {
    control,
    formState: { errors, isSubmitting, submitCount },
    getValues,
    handleSubmit,
    setError,
    setValue,
  } = formMethods;

  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createAlert } = useCreateAlertDefinition(
    getValues('serviceType')!
  );

  const serviceTypeWatcher = useWatch({ control, name: 'serviceType' });
  const entityGroupingWatcher = useWatch({ control, name: 'type' });
  const [maxScrapeInterval, setMaxScrapeInterval] = React.useState<number>(0);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAlert(filterFormValues(values));
      enqueueSnackbar(CREATE_ALERT_SUCCESS_MESSAGE, {
        variant: 'success',
      });
      alertCreateExit();
    } catch (errors) {
      handleMultipleError<CreateAlertDefinitionForm>({
        errorFieldMap: CREATE_ALERT_ERROR_FIELD_MAP,
        errors,
        multiLineErrorSeparator: MULTILINE_ERROR_SEPARATOR,
        setError,
        singleLineErrorSeparator: SINGLELINE_ERROR_SEPARATOR,
      });

      const rootError = errors.find((error: APIError) => !error.field);
      if (rootError) {
        enqueueSnackbar(`Creating alert failed: ${rootError.reason}`, {
          variant: 'error',
        });
      }
    }
  });
  const previousSubmitCount = React.useRef<number>(0);
  React.useEffect(() => {
    if (!isEmpty(errors) && submitCount > previousSubmitCount.current) {
      scrollErrorIntoView(undefined, { behavior: 'smooth' });
    }
  }, [errors, submitCount]);

  const handleServiceTypeChange = React.useCallback(() => {
    // Reset the criteria to initial state
    setValue('rule_criteria.rules', [{ ...criteriaInitialValues }]);
    setValue('entity_ids', []);
    setValue('trigger_conditions', triggerConditionInitialValues);
  }, [setValue]);

  React.useEffect(() => {
    setValidationSchema(
      getSchemaWithEntityIdValidation({
        aclpAlertServiceTypeConfig: flags.aclpAlertServiceTypeConfig ?? [],
        baseSchema: alertDefinitionFormSchema,
        serviceTypeObj: serviceTypeWatcher,
      })
    );
  }, [flags.aclpAlertServiceTypeConfig, serviceTypeWatcher]);

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
              control={control}
              name="label"
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
            />
            <Controller
              control={control}
              name="description"
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
            />
            <CloudPulseServiceSelect
              handleServiceTypeChange={handleServiceTypeChange}
              name="serviceType"
            />
            <CloudPulseAlertSeveritySelect name="severity" />
            <AlertEntityGroupingSelect name="type" />
            {entityGroupingWatcher === 'user' && (
              <CloudPulseModifyAlertResources name="entity_ids" />
            )}
            {entityGroupingWatcher === 'region-user' && (
              <CloudPulseModifyAlertRegions name="entity_ids" />
            )}
            <MetricCriteriaField
              name="rule_criteria.rules"
              serviceType={serviceTypeWatcher!}
              setMaxInterval={(interval: number) =>
                setMaxScrapeInterval(interval)
              }
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
