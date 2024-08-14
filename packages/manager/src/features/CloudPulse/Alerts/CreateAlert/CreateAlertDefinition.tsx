import { createAlertDefinitionSchema } from '@linode/validation';
import { ErrorMessage, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useCreateAlertDefinition } from 'src/queries/cloudpulse/alerts';
import { useDatabaseEnginesQuery } from 'src/queries/databases/databases';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { AlertSeverityOptions } from '../constants';
import { EngineOption } from './GeneralInformation/EngineOption';
import { CloudPulseRegionSelect } from './GeneralInformation/RegionSelect';
import { CloudPulseMultiResourceSelect } from './GeneralInformation/ResourceMultiSelect';
import { CloudPulseServiceSelect } from './GeneralInformation/ServiceTypeSelect';

import type { APIError } from '@linode/api-v4';
import type { CreateAlertDefinitionPayload } from '@linode/api-v4/lib/cloudpulse/types';

export const initialValues: CreateAlertDefinitionPayload = {
  criteria: [
    {
      aggregation_type: '',
      dimension_filters: [],
      metric: '',
      operator: '',
      value: 0,
    },
  ],
  engineOption: '',
  name: '',
  notifications: [],
  region: '',
  resource_ids: [],
  service_type: '',
  severity: '',
  sink_ids: [],
  triggerCondition: {
    criteria_condition: '',
    evaluation_period_seconds: '',
    polling_interval_seconds: '',
    trigger_occurrences: 0,
  },
};

export const CreateAlertDefinition = React.memo(() => {
  const { mutateAsync } = useCreateAlertDefinition();
  const { enqueueSnackbar } = useSnackbar();
  const { data: engineOptions } = useDatabaseEnginesQuery(true);

  const formik = useFormik({
    initialValues,
    onSubmit(
      values: CreateAlertDefinitionPayload,
      { resetForm, setErrors, setStatus, setSubmitting }
    ) {
      setStatus(undefined);
      setErrors({});
      const payload = { ...values };

      mutateAsync(payload)
        .then(() => {
          setSubmitting(false);
          enqueueSnackbar(`Alert created`, {
            variant: 'success',
          });
          resetForm();
          history.goBack();
        })
        .catch((err: APIError[]) => {
          const mapErrorToStatus = () =>
            setStatus({ generalError: getErrorMap([], err).none });
          setSubmitting(false);
          handleFieldErrors(setErrors, err);
          handleGeneralErrors(mapErrorToStatus, err, 'Error creating an alert');
        });
    },
    validationSchema: createAlertDefinitionSchema,
  });

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    status,
    values,
  } = formik;

  const generalError = status?.generalError;
  const history = useHistory();
  const onCancel = () => {
    history.goBack();
  };

  const generateCrumbOverrides = (pathname: string) => {
    const pathParts = pathname.split('/').filter(Boolean);
    const lastTwoParts = pathParts.slice(-2);
    const fullPaths: any = [];

    pathParts.forEach((_, index) => {
      fullPaths.push('/' + pathParts.slice(0, index + 1).join('/'));
    });

    const overrides = lastTwoParts.map((part, index) => ({
      label: part,
      linkTo: fullPaths[pathParts.length - 2 + index],
      position: index + 1,
    }));

    return { newPathname: '/' + lastTwoParts.join('/'), overrides };
  };

  const { newPathname, overrides } = React.useMemo(
    () => generateCrumbOverrides(location.pathname),
    []
  );

  const CustomErrorMessage = (props: any) => (
    <Box sx={(theme) => ({ color: theme.color.red })}>{props.children}</Box>
  );

  // eslint-disable-next-line no-console
  console.log(errors);
  return (
    <Paper>
      <Breadcrumb
        crumbOverrides={overrides}
        pathname={newPathname}
      ></Breadcrumb>
      <FormikProvider value={formik}>
        <form onSubmit={handleSubmit}>
          {generalError && (
            <Notice
              data-qa-error
              key={status}
              text={status?.generalError ?? 'An unexpected error occurred'}
              variant="error"
            />
          )}
          <Typography variant="h2">1. General Information</Typography>
          <TextField
            // errorText="Name error"
            label="Name"
            name={'name'}
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.name ? values.name : ''}
          />
          {formik.touched && formik.touched.name && errors.name ? (
            <ErrorMessage component={CustomErrorMessage} name="name" />
          ) : null}
          <TextField
            label="Description"
            name={'description'}
            onBlur={handleBlur}
            onChange={handleChange}
            optional
            value={values.description ? values.description : ''}
          />
          <CloudPulseServiceSelect name={'service_type'} />
          {formik.touched &&
          formik.touched.service_type &&
          errors.service_type ? (
            <ErrorMessage component={CustomErrorMessage} name="service_type" />
          ) : null}
          {formik.values.service_type === 'dbaas' && (
            <EngineOption
              engineOptions={engineOptions ? engineOptions : []}
              name={'engineOption'}
            />
          )}
          <CloudPulseRegionSelect name={'region'} />
          {formik.touched && formik.touched.region && errors.region ? (
            <ErrorMessage component={CustomErrorMessage} name="region" />
          ) : null}
          <CloudPulseMultiResourceSelect
            cluster={values.service_type === 'dbaas' ? true : false}
            disabled={false}
            name={'resource_ids'}
            region={values.region ? values.region : ''}
            resourceType={values.service_type ? values.service_type : ''}
          />
          {formik.touched &&
          formik.touched.resource_ids &&
          formik.errors.resource_ids ? (
            <ErrorMessage component={CustomErrorMessage} name="resource_ids" />
          ) : null}
          <Autocomplete
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            onBlur={(event) => {
              formik.handleBlur(event);
              formik.setFieldTouched('severity', true);
            }}
            onChange={(_, value) => {
              setFieldValue('severity', value?.value);
            }}
            value={
              values?.severity
                ? {
                    label: values.severity,
                    value: values.severity,
                  }
                : null
            }
            label={'Severity'}
            options={AlertSeverityOptions}
            size="medium"
            textFieldProps={{ labelTooltipText: 'Choose the alert severity' }}
          />
          {formik.touched &&
          formik.touched.severity &&
          formik.errors.severity ? (
            <ErrorMessage component={CustomErrorMessage} name="severity" />
          ) : null}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Submit',
              loading: isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onCancel,
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </form>
      </FormikProvider>
    </Paper>
  );
});
