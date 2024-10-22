import { yupResolver } from '@hookform/resolvers/yup';
import { createAlertDefinitionSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useCreateAlertDefinition } from 'src/queries/cloudpulse/alerts';

import { generateCrumbOverrides } from '../util';
import { CloudPulseAlertSeveritySelect } from './GeneralInformation/AlertSeveritySelect';

import type {
  CreateAlertDefinitionPayload,
  MetricCriteria,
  TriggerCondition,
} from '@linode/api-v4/lib/cloudpulse/types';

const triggerConditionInitialValues: TriggerCondition = {
  criteria_condition: '',
  evaluation_period_seconds: '',
  polling_interval_seconds: '',
  trigger_occurrences: 0,
};
const criteriaInitialValues: MetricCriteria[] = [
  {
    aggregation_type: '',
    dimension_filters: [],
    metric: '',
    operator: '',
    value: 0,
  },
];
export const initialValues: CreateAlertDefinitionPayload = {
  channel_ids: [],
  engineOption: '',
  name: '',
  region: '',
  resource_ids: [],
  rule_criteria: { rules: criteriaInitialValues },
  service_type: '',
  severity: '',
  triggerCondition: triggerConditionInitialValues,
};

export interface ErrorUtilsProps {
  errors: string | string[] | undefined;
  touched: boolean | undefined;
}
export const ErrorMessage = ({ errors, touched }: ErrorUtilsProps) => {
  if (touched && errors) {
    return <Box sx={(theme) => ({ color: theme.color.red })}>{errors}</Box>;
  } else {
    return null;
  }
};

export const CreateAlertDefinition = () => {
  const history = useHistory();
  const alertCreateExit = () => {
    const pathParts = location.pathname.split('/');
    pathParts.pop();
    const previousPage = pathParts.join('/');
    history.push(previousPage);
  };

  const formMethods = useForm<CreateAlertDefinitionPayload>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: yupResolver(createAlertDefinitionSchema),
  });

  const { control, formState, handleSubmit, setError } = formMethods;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createAlert } = useCreateAlertDefinition();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAlert(values);
      enqueueSnackbar('Alert successfully created', {
        variant: 'success',
      });
      alertCreateExit();
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  });

  const { newPathname, overrides } = React.useMemo(
    () => generateCrumbOverrides(location.pathname),
    []
  );

  return (
    <Paper>
      <Breadcrumb
        crumbOverrides={overrides}
        pathname={newPathname}
      ></Breadcrumb>
      <FormProvider {...formMethods}>
        <form onSubmit={onSubmit}>
          <Typography variant="h2">1. General Information</Typography>
          <Controller
            render={({ field, fieldState }) => (
              <>
                <TextField
                  label="Name"
                  name={'name'}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(e.target.value)}
                  value={field.value ?? ''}
                />
                <ErrorMessage
                  errors={fieldState.error?.message}
                  touched={fieldState.isTouched}
                />
              </>
            )}
            control={control}
            name="name"
          />
          <Controller
            render={({ field, fieldState }) => (
              <>
                <TextField
                  errorText={fieldState.error?.message}
                  label="Description"
                  name={'description'}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(e.target.value)}
                  optional
                  value={field.value ?? ''}
                />
                <ErrorMessage
                  errors={fieldState.error?.message}
                  touched={fieldState.isTouched}
                />
              </>
            )}
            control={control}
            name="description"
          />
          <CloudPulseAlertSeveritySelect name="severity" />
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
        </form>
      </FormProvider>
    </Paper>
  );
};
