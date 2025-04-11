import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  InputAdornment,
  Notice,
  Select,
  TextField,
} from '@linode/ui';
import { createServiceMonitorSchema } from '@linode/validation/lib/managed.schema';
import Grid from '@mui/material/Grid2';
import { useMatch, useNavigate, useParams } from '@tanstack/react-router';
import { Formik } from 'formik';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';
import {
  useCreateMonitorMutation,
  useUpdateMonitorMutation,
} from 'src/queries/managed/managed';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import type {
  APIError,
  ManagedCredential,
  ManagedServiceMonitor,
  ManagedServicePayload,
  ServiceType,
} from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { FormikBag } from 'formik';

export type FormikProps = FormikBag<{}, ManagedServicePayload>;

export interface MonitorDrawerProps {
  credentials: ManagedCredential[];
  groups: string[];
  isFetching?: boolean;
  monitor?: ManagedServiceMonitor;
  open: boolean;
  successMsg?: string;
}

const typeOptions: SelectOption<ServiceType>[] = [
  {
    label: 'URL',
    value: 'url',
  },
  {
    label: 'TCP',
    value: 'tcp',
  },
];

const getCredentialOptions = (
  credentials: ManagedCredential[]
): SelectOption<number>[] => {
  return credentials.map((thisCredential) => {
    return {
      label: thisCredential.label,
      value: thisCredential.id,
    };
  });
};

const getGroupsOptions = (groups: string[]): SelectOption<string>[] => {
  return groups.map((thisGroup) => ({
    label: thisGroup,
    value: thisGroup,
  }));
};

const helperText = {
  body: 'Response must contain this string or an alert will be triggered.',
  consultation_group:
    "If we need help along the way, we'll contact someone from this group.",
  credentials:
    'Any additional credentials required for incident response or routine maintenance.',
  url: 'The URL to request.',
};

const getValueFromItem = (value: string, options: SelectOption<string>[]) => {
  return options.find((thisOption) => thisOption.value === value) || null;
};

const getMultiValuesFromItems = (
  values: number[],
  options: SelectOption<number>[]
) => {
  return options.filter((thisOption) => values.includes(thisOption.value));
};

const emptyInitialValues = {
  address: '',
  body: '',
  consultation_group: '',
  credentials: [],
  label: '',
  notes: '',
  service_type: 'url',
  timeout: 10,
} as ManagedServicePayload;

export const MonitorDrawer = (props: MonitorDrawerProps) => {
  const { credentials, groups, isFetching, monitor, open } = props;
  const { monitorId } = useParams({ strict: false });
  const navigate = useNavigate();
  const match = useMatch({ strict: false });
  const credentialOptions = getCredentialOptions(credentials);
  const groupOptions = getGroupsOptions(groups);

  const isEditing = match.routeId === '/managed/monitors/$monitorId/edit';

  const { mutateAsync: updateServiceMonitor } = useUpdateMonitorMutation(
    monitorId ?? -1
  );
  const { mutateAsync: createServiceMonitor } = useCreateMonitorMutation();

  /**
   * We only care about the fields in the form. Previously unfilled optional
   * values such as `notes` come back from the API as null, so remove those
   * as well.
   */
  const _monitor = monitor
    ? (Object.fromEntries(
        Object.entries(monitor).filter(
          ([key, value]) => value !== null && key in emptyInitialValues
        )
      ) as ManagedServicePayload)
    : ({} as ManagedServicePayload);

  const initialValues = { ...emptyInitialValues, ..._monitor };

  const submitMonitorForm = (
    values: ManagedServicePayload,
    { setErrors, setStatus, setSubmitting }: FormikProps
  ) => {
    const _success = () => {
      setSubmitting(false);
      navigate({ to: '/managed/monitors' });
    };

    const _error = (e: APIError[]) => {
      const defaultMessage = `Unable to ${
        isEditing ? 'update' : 'create'
      } this Monitor. Please try again later.`;
      const mapErrorToStatus = (generalError: string) =>
        setStatus({ generalError });

      setSubmitting(false);
      handleFieldErrors(setErrors, e);
      handleGeneralErrors(mapErrorToStatus, e, defaultMessage);
      setSubmitting(false);
    };

    // Clear drawer error state
    setStatus(undefined);

    if (isEditing) {
      updateServiceMonitor({ ...values, timeout: +values.timeout })
        .then(_success)
        .catch(_error);
    } else {
      createServiceMonitor({
        ...values,
        timeout: +values.timeout,
      })
        .then(_success)
        .catch(_error);
    }
  };

  return (
    <Drawer
      isFetching={isFetching}
      NotFoundComponent={NotFound}
      onClose={() => navigate({ to: '/managed/monitors' })}
      open={open}
      title={isEditing ? 'Edit Monitor' : 'Add Monitor'}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={submitMonitorForm}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={createServiceMonitorSchema}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          status,
          values,
        }) => (
          <>
            {status && (
              <Notice
                data-qa-error
                key={status}
                text={status.generalError}
                variant="error"
              />
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                data-qa-add-label
                error={!!errors.label}
                errorText={errors.label}
                label="Monitor Label"
                name="label"
                onBlur={handleBlur}
                onChange={handleChange}
                required={!isEditing}
                value={values.label}
              />

              <Select
                clearable
                data-qa-add-consultation-group
                errorText={errors.consultation_group}
                label="Contact Group"
                onBlur={handleBlur}
                onChange={(_, item: SelectOption<ServiceType>) =>
                  setFieldValue(
                    'consultation_group',
                    item === null ? '' : item.value
                  )
                }
                options={groupOptions}
                placeholder="Select a group..."
                searchable
                textFieldProps={{
                  tooltipText: helperText.consultation_group,
                }}
                value={getValueFromItem(
                  values.consultation_group || '',
                  groupOptions
                )}
              />

              <Grid container spacing={2}>
                <Grid
                  size={{
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <Select
                    data-qa-add-service-type
                    errorText={errors.service_type}
                    label="Monitor Type"
                    onBlur={handleBlur}
                    onChange={(_, item: SelectOption<ServiceType>) =>
                      setFieldValue('service_type', item.value)
                    }
                    options={typeOptions}
                    textFieldProps={{
                      required: !isEditing,
                    }}
                    value={getValueFromItem(values.service_type, typeOptions)}
                  />
                </Grid>
                <Grid
                  size={{
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <TextField
                    data-qa-add-timeout
                    error={!!errors.timeout}
                    errorText={errors.timeout}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">seconds</InputAdornment>
                      ),
                    }}
                    label="Response Timeout"
                    name="timeout"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required={!isEditing}
                    type="number"
                    value={values.timeout}
                  />
                </Grid>
              </Grid>

              <TextField
                data-qa-add-address
                error={!!errors.address}
                errorText={errors.address}
                label="URL"
                name="address"
                onBlur={handleBlur}
                onChange={handleChange}
                required={!isEditing}
                tooltipText={helperText.url}
                value={values.address}
              />
              <TextField
                data-qa-add-body
                error={!!errors.body}
                errorText={errors.body}
                label="Response Body Match"
                name="body"
                onBlur={handleBlur}
                onChange={handleChange}
                tooltipText={helperText.body}
                value={values.body}
              />
              <TextField
                data-qa-add-notes
                error={!!errors.notes}
                errorText={errors.notes}
                label="Instructions / Notes"
                multiline
                name="notes"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.notes}
              />
              <Autocomplete
                data-qa-add-credentials
                errorText={errors.credentials}
                label="Credentials"
                multiple
                onBlur={handleBlur}
                onChange={(_, items: null | SelectOption<number>[]) => {
                  setFieldValue(
                    'credentials',
                    items?.map((thisItem) => thisItem.value) || []
                  );
                }}
                options={credentialOptions}
                placeholder={
                  values?.credentials?.length === 0 ? 'None Required' : ''
                }
                textFieldProps={{
                  tooltipText: helperText.credentials,
                }}
                value={getMultiValuesFromItems(
                  values.credentials || [],
                  credentialOptions
                )}
              />
              <ActionsPanel
                primaryButtonProps={{
                  'data-testid': 'submit',
                  label: isEditing ? 'Save Changes' : 'Add Monitor',
                  loading: isSubmitting,
                  onClick: () => handleSubmit(),
                }}
                secondaryButtonProps={{
                  'data-testid': 'cancel',
                  label: 'Cancel',
                  onClick: () => navigate({ to: '/managed/monitors' }),
                }}
              />
            </form>
          </>
        )}
      </Formik>
    </Drawer>
  );
};
