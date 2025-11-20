import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from '@linode/api-v4';
import { ActionsPanel, Paper, TextField, Typography } from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { useFlags } from 'src/hooks/useFlags';
import { useEditAlertDefinition } from 'src/queries/cloudpulse/alerts';
import { useCloudPulseServiceByServiceType } from 'src/queries/cloudpulse/services';

import {
  CREATE_ALERT_ERROR_FIELD_MAP as EDIT_ALERT_ERROR_FIELD_MAP,
  entityLabelMap,
  MULTILINE_ERROR_SEPARATOR,
  SINGLELINE_ERROR_SEPARATOR,
  UPDATE_ALERT_SUCCESS_MESSAGE,
} from '../constants';
import { MetricCriteriaField } from '../CreateAlert/Criteria/MetricCriteria';
import { TriggerConditions } from '../CreateAlert/Criteria/TriggerConditions';
import { EntityScopeRenderer } from '../CreateAlert/EntityScopeRenderer';
import { AlertEntityScopeSelect } from '../CreateAlert/GeneralInformation/AlertEntityScopeSelect';
import { CloudPulseAlertSeveritySelect } from '../CreateAlert/GeneralInformation/AlertSeveritySelect';
import { EntityTypeSelect } from '../CreateAlert/GeneralInformation/EntityTypeSelect';
import { CloudPulseServiceSelect } from '../CreateAlert/GeneralInformation/ServiceTypeSelect';
import { AddChannelListing } from '../CreateAlert/NotificationChannels/AddChannelListing';
import { alertDefinitionFormSchema } from '../CreateAlert/schemas';
import { filterEditFormValues } from '../CreateAlert/utilities';
import {
  convertAlertDefinitionValues,
  getSchemaWithEntityIdValidation,
  handleMultipleError,
} from '../Utils/utils';

import type { CreateAlertDefinitionForm as EditAlertDefintionForm } from '../CreateAlert/types';
import type {
  Alert,
  AlertDefinitionScope,
  APIError,
  CloudPulseServiceType,
  EditAlertPayloadWithService,
} from '@linode/api-v4';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

export interface EditAlertProps {
  /**
   * The details of the alert being edited.
   */
  alertDetails: Alert;
  /**
   * The type of service associated with the alert
   */
  serviceType: CloudPulseServiceType;
}

export const EditAlertDefinition = (props: EditAlertProps) => {
  const { alertDetails, serviceType } = props;
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const filteredAlertDefinitionValues = convertAlertDefinitionValues(
    alertDetails,
    serviceType
  );

  const entityType =
    serviceType === 'firewall'
      ? alertDetails.rule_criteria.rules[0]?.label.includes(
          entityLabelMap['nodebalancer']
        )
        ? 'nodebalancer'
        : 'linode'
      : undefined;

  const flags = useFlags();
  const formMethods = useForm<EditAlertDefintionForm>({
    defaultValues: {
      ...filteredAlertDefinitionValues,
      serviceType,
      scope: alertDetails.scope,
      entity_type: entityType,
    },
    mode: 'onBlur',
    resolver: yupResolver(
      getSchemaWithEntityIdValidation({
        aclpAlertServiceTypeConfig: flags.aclpAlertServiceTypeConfig ?? [],
        baseSchema: alertDefinitionFormSchema,
        serviceTypeObj: alertDetails.service_type,
      })
    ),
  });

  const alertId = alertDetails.id;
  const { mutateAsync: editAlert } = useEditAlertDefinition();
  const { control, formState, handleSubmit, setError } = formMethods;
  const [maxScrapeInterval, setMaxScrapeInterval] = React.useState<number>(0);
  const scopeWatcher = useWatch<EditAlertDefintionForm>({
    name: 'scope',
    control,
  }) as AlertDefinitionScope | null;

  const {
    data: serviceMetadata,
    isLoading: serviceMetadataLoading,
    error: serviceMetadataError,
  } = useCloudPulseServiceByServiceType(serviceType ?? '', !!serviceType);

  const onSubmit = handleSubmit(async (values) => {
    const editPayload: EditAlertPayloadWithService = filterEditFormValues(
      values,
      serviceType,
      alertDetails.severity,
      alertId
    );
    try {
      await editAlert(editPayload);
      enqueueSnackbar(UPDATE_ALERT_SUCCESS_MESSAGE, {
        variant: 'success',
      });
      navigate({ to: definitionLanding });
    } catch (errors) {
      handleMultipleError<EditAlertDefintionForm>({
        errorFieldMap: EDIT_ALERT_ERROR_FIELD_MAP,
        errors,
        multiLineErrorSeparator: MULTILINE_ERROR_SEPARATOR,
        setError,
        singleLineErrorSeparator: SINGLELINE_ERROR_SEPARATOR,
      });

      const rootError = errors.find((error: APIError) => !error.field);
      if (rootError) {
        enqueueSnackbar(`Editing alert failed: ${rootError.reason}`, {
          variant: 'error',
        });
      }
    }
  });
  const definitionLanding = '/alerts/definitions';

  const overrides: CrumbOverridesProps[] = [
    {
      label: 'Definitions',
      linkTo: definitionLanding,
      position: 1,
    },
  ];
  const { resetField } = formMethods;
  const handleEntityTypeChange = React.useCallback(() => {
    // Reset the criteria when entity type changes
    resetField('rule_criteria.rules', {
      defaultValue: [
        {
          aggregate_function: null,
          dimension_filters: [],
          metric: null,
          operator: null,
          threshold: 0,
        },
      ],
    });
  }, [resetField]);
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
        <form onSubmit={onSubmit}>
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
          <CloudPulseServiceSelect isDisabled name="serviceType" />
          {serviceType === 'firewall' && (
            <EntityTypeSelect
              name="entity_type"
              onEntityTypeChange={handleEntityTypeChange}
            />
          )}
          <CloudPulseAlertSeveritySelect name="severity" />
          <AlertEntityScopeSelect
            disabled
            formMode="edit"
            name="scope"
            serviceType={serviceType}
          />
          <EntityScopeRenderer scope={scopeWatcher} />
          <MetricCriteriaField
            name="rule_criteria.rules"
            serviceType={serviceType}
            setMaxInterval={setMaxScrapeInterval}
          />
          <TriggerConditions
            maxScrapingInterval={maxScrapeInterval}
            name="trigger_conditions"
            serviceMetadata={serviceMetadata?.alert ?? undefined}
            serviceMetadataError={serviceMetadataError}
            serviceMetadataLoading={serviceMetadataLoading}
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
              onClick: () => navigate({ to: definitionLanding }),
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </form>
      </FormProvider>
    </Paper>
  );
};
