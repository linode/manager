import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from '@linode/api-v4';
import { ActionsPanel, Notice, Paper, TextField, Typography } from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useFlags } from 'src/hooks/useFlags';
import {
  useAllEntitiesByAlertIdQuery,
  useCloneAlertDefinition,
} from 'src/queries/cloudpulse/alerts';
import { useCloudPulseServiceByServiceType } from 'src/queries/cloudpulse/services';

import {
  CLONE_ALERT_SUCCESS_MESSAGE,
  CREATE_ALERT_ERROR_FIELD_MAP,
  entityLabelMap,
  MULTILINE_ERROR_SEPARATOR,
  SINGLELINE_ERROR_SEPARATOR,
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
import { filterFormValues } from '../CreateAlert/utilities';
import {
  convertAlertDefinitionValues,
  getClonedAlertLabel,
  getSchemaWithEntityIdValidation,
  handleMultipleError,
} from '../Utils/utils';

import type { CreateAlertDefinitionForm } from '../CreateAlert/types';
import type {
  Alert,
  AlertDefinitionScope,
  APIError,
  CloudPulseServiceType,
} from '@linode/api-v4';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

interface CloneAlertProps {
  alertDetails: Alert;
  serviceType: CloudPulseServiceType;
}

export const CloneAlertDefinition = ({
  alertDetails,
  serviceType,
}: CloneAlertProps) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const filteredAlertDefinitionValues = React.useMemo(
    () => convertAlertDefinitionValues(alertDetails, serviceType),
    [alertDetails, serviceType]
  );

  const entityType = React.useMemo(() => {
    if (serviceType !== 'firewall') {
      return undefined;
    }

    return alertDetails.rule_criteria.rules[0]?.label.includes(
      entityLabelMap['nodebalancer']
    )
      ? 'nodebalancer'
      : 'linode';
  }, [alertDetails, serviceType]);

  const flags = useFlags();
  const formMethods = useForm<CreateAlertDefinitionForm>({
    defaultValues: {
      ...filteredAlertDefinitionValues,
      label: getClonedAlertLabel(filteredAlertDefinitionValues.label ?? ''),
      serviceType,
      scope: alertDetails.scope,
      entity_type: entityType,
    },
    mode: 'onBlur',
    context: {
      maxDimensionFilterValues:
        flags.aclpAlerting?.maxDimensionFiltersValues ?? undefined,
    },
    resolver: yupResolver(
      getSchemaWithEntityIdValidation({
        aclpAlertServiceTypeConfig: flags.aclpAlertServiceTypeConfig ?? [],
        baseSchema: alertDefinitionFormSchema,
        serviceTypeObj: alertDetails.service_type,
      })
    ),
  });

  const definitionLanding = '/alerts/definitions';
  const { mutateAsync: cloneAlert } = useCloneAlertDefinition();
  const { control, formState, handleSubmit, setError, setValue } = formMethods;

  const { data: entities } = useAllEntitiesByAlertIdQuery(
    serviceType,
    String(alertDetails.id)
  );

  React.useEffect(() => {
    if (entities) {
      setValue(
        'entity_ids',
        entities.map((entity) => entity.id)
      );
    }
  }, [entities, setValue]);

  const [maxScrapeInterval, setMaxScrapeInterval] = React.useState<number>(0);

  const scopeWatcher = useWatch<CreateAlertDefinitionForm>({
    name: 'scope',
    control,
  }) as AlertDefinitionScope | null;

  const {
    data: serviceMetadata,
    isLoading: serviceMetadataLoading,
    error: serviceMetadataError,
  } = useCloudPulseServiceByServiceType(serviceType ?? '', !!serviceType);

  const hasAPIError = useWatch({ control, name: 'hasAPIError' });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await cloneAlert({
        ...filterFormValues(values, flags.aclpAlerting?.enableGroupBy),
        originalAlertId: alertDetails.id,
        serviceType,
      });

      enqueueSnackbar(CLONE_ALERT_SUCCESS_MESSAGE, {
        variant: 'success',
      });
      navigate({ to: definitionLanding });
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
        enqueueSnackbar(`Cloning alert failed: ${rootError.reason}`, {
          variant: 'error',
        });
      }
    }
  });

  const overrides: CrumbOverridesProps[] = [
    {
      label: 'Definitions',
      linkTo: definitionLanding,
      position: 1,
    },
  ];

  const { resetField } = formMethods;
  const handleEntityTypeChange = React.useCallback(() => {
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
    previousSubmitCount.current = formState.submitCount;
  }, [formState.errors, formState.submitCount]);

  return (
    <Paper sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}>
      <DocumentTitleSegment segment="Clone an Alert" />
      <Breadcrumb crumbOverrides={overrides} pathname={'/Definitions/Clone'} />
      {hasAPIError && (
        <Notice
          sx={{ marginTop: 2 }}
          text="Some alert settings couldn't be loaded. Available data is shown but editing is disabled. Try reloading the page or check back later."
          variant="warning"
        />
      )}
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
          <AddChannelListing name="channel_ids" serviceType={serviceType} />
          <ActionsPanel
            primaryButtonProps={{
              label: 'Submit',
              loading: formState.isSubmitting,
              type: 'submit',
              disabled: hasAPIError,
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
