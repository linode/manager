import { yupResolver } from '@hookform/resolvers/yup';
import { Paper, TextField, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { useEditAlertDefinition } from 'src/queries/cloudpulse/alerts';

import { MetricCriteriaField } from '../CreateAlert/Criteria/MetricCriteria';
import { TriggerConditions } from '../CreateAlert/Criteria/TriggerConditions';
import { CloudPulseAlertSeveritySelect } from '../CreateAlert/GeneralInformation/AlertSeveritySelect';
import { CloudPulseServiceSelect } from '../CreateAlert/GeneralInformation/ServiceTypeSelect';
import { AddChannelListing } from '../CreateAlert/NotificationChannels/AddChannelListing';
import { CloudPulseModifyAlertResources } from '../CreateAlert/Resources/CloudPulseModifyAlertResources';
import { convertAlertDefinitionValues } from '../Utils/utils';
import { EditAlertDefinitionFormSchema } from './schemas';

import type {
  AlertServiceType,
  EditAlertDefinitionPayload,
} from '@linode/api-v4';
import type { Alert } from '@linode/api-v4';
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

  const { enqueueSnackbar } = useSnackbar();

  const filteredAlertDefinitionValues = convertAlertDefinitionValues(
    alertDetails,
    serviceType
  );
  const formMethods = useForm<EditAlertDefinitionPayload>({
    defaultValues: filteredAlertDefinitionValues,
    mode: 'onBlur',
    resolver: yupResolver(
      EditAlertDefinitionFormSchema as ObjectSchema<EditAlertDefinitionPayload>
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
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          enqueueSnackbar(`Alert update failed: ${error.reason}`, {
            variant: 'error',
          });
          setError('root', { message: error.reason });
        }
      }
    }
  });
  const definitionLanding = '/monitor/alerts/definitions';

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

  return (
    <Paper sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}>
      <Breadcrumb crumbOverrides={overrides} pathname={'/Definitions/Edit'} />
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
          <CloudPulseServiceSelect isDisabled name="serviceType" />
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
