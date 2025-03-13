import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from '@linode/api-v4';
import { ActionsPanel, Paper, TextField, Typography } from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { useFlags } from 'src/hooks/useFlags';
import { useEditAlertDefinition } from 'src/queries/cloudpulse/alerts';

import { ERROR_PARENT_FIELD_MAP } from '../constants';
import { MetricCriteriaField } from '../CreateAlert/Criteria/MetricCriteria';
import { TriggerConditions } from '../CreateAlert/Criteria/TriggerConditions';
import { CloudPulseAlertSeveritySelect } from '../CreateAlert/GeneralInformation/AlertSeveritySelect';
import { CloudPulseServiceSelect } from '../CreateAlert/GeneralInformation/ServiceTypeSelect';
import { AddChannelListing } from '../CreateAlert/NotificationChannels/AddChannelListing';
import { CloudPulseModifyAlertResources } from '../CreateAlert/Resources/CloudPulseModifyAlertResources';
import {
  convertAlertDefinitionValues,
  getValidationSchema,
  handleErrorMap,
} from '../Utils/utils';
import { EditAlertDefinitionFormSchema } from './schemas';

import type {
  APIError,
  Alert,
  AlertServiceType,
  EditAlertDefinitionPayload,
} from '@linode/api-v4';
import type { ObjectSchema } from 'yup';

export interface EditAlertProps {
  /**
   * The details of the alert being edited.
   */
  alertDetails: Alert;
  /**
   * The type of service associated with the alert
   */
  serviceType: AlertServiceType;
}

export const EditAlertDefinition = (props: EditAlertProps) => {
  const { alertDetails, serviceType } = props;
  const history = useHistory();
  const formRef = React.useRef<HTMLFormElement>(null);
  const flags = useFlags();
  const editAlertScheme = EditAlertDefinitionFormSchema as ObjectSchema<EditAlertDefinitionPayload>;

  const { enqueueSnackbar } = useSnackbar();

  const filteredAlertDefinitionValues = convertAlertDefinitionValues(
    alertDetails,
    serviceType
  );
  const formMethods = useForm<EditAlertDefinitionPayload>({
    defaultValues: filteredAlertDefinitionValues,
    mode: 'onBlur',
    resolver: yupResolver(
      getValidationSchema(
        alertDetails?.service_type,
        flags.aclpAlertServiceTypeConfig ?? [],
        editAlertScheme,
        true
      ) as ObjectSchema<EditAlertDefinitionPayload>
    ),
  });

  const alertId = alertDetails.id;
  const { mutateAsync: editAlert } = useEditAlertDefinition();
  const { control, formState, handleSubmit, setError } = formMethods;
  const [maxScrapeInterval, setMaxScrapeInterval] = React.useState<number>(0);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await editAlert({ alertId, serviceType, ...values });
      enqueueSnackbar('Alert successfully updated.', {
        variant: 'success',
      });
      history.push(definitionLanding);
    } catch (errors) {
      const errorMap = handleErrorMap(errors, ERROR_PARENT_FIELD_MAP);

      for (const [errorField, errorMessage] of Object.entries(errorMap)) {
        setError(errorField as keyof EditAlertDefinitionPayload, {
          message: errorMessage,
        });
      }

      const rootError = errors.find((error: APIError) => !error.field);
      if (rootError) {
        enqueueSnackbar(`Alert failed: ${rootError.reason}`, {
          variant: 'error',
        });
      }
    }
  });
  const definitionLanding = '/alerts/definitions';

  const overrides = [
    {
      label: 'Definitions',

      linkTo: definitionLanding,

      position: 1,
    },

    {
      label: 'Edit',

      linkTo: `${definitionLanding}/edit/${serviceType}/${alertId}`,

      position: 2,
    },
  ];

  const previousSubmitCount = React.useRef<number>(0);
  React.useEffect(() => {
    if (
      !isEmpty(formState.errors) &&
      formState.submitCount > previousSubmitCount.current
    ) {
      scrollErrorIntoView(undefined, { behavior: 'smooth' });
    }
  }, [formState.errors, formState.submitCount]);

  return (
    <Paper sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}>
      <Breadcrumb crumbOverrides={overrides} pathname={'/Definitions/Edit'} />
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
          <CloudPulseServiceSelect isDisabled={true} name="serviceType" />
          <CloudPulseAlertSeveritySelect name="severity" />
          <CloudPulseModifyAlertResources name="entity_ids" />
          <MetricCriteriaField
            name="rule_criteria.rules"
            serviceType={serviceType}
            setMaxInterval={setMaxScrapeInterval}
          />
          <TriggerConditions
            maxScrapingInterval={maxScrapeInterval}
            name="trigger_conditions"
          />
          <AddChannelListing name="channel_ids" />
          <ActionsPanel
            primaryButtonProps={{
              label: 'Submit',
              loading: formState.isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: () => history.push(definitionLanding),
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </form>
      </FormProvider>
    </Paper>
  );
};
