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
import Grid from '@mui/material/Grid';
import { Formik } from 'formik';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';

import type {
  ManagedCredential,
  ManagedServiceMonitor,
  ManagedServicePayload,
  ServiceType,
} from '@linode/api-v4/lib/managed';
import type { SelectOption } from '@linode/ui';
export interface MonitorDrawerProps {
  credentials: ManagedCredential[];
  groups: string[];
  label?: string;
  mode: 'create' | 'edit';
  monitor?: ManagedServiceMonitor;
  onClose: () => void;
  onSubmit: (values: ManagedServicePayload, formikProps: any) => void;
  open: boolean;
  successMsg?: string;
}

export const modes = {
  CREATING: 'create',
  EDITING: 'edit',
};

const titleMap = {
  [modes.CREATING]: 'Add Monitor',
  [modes.EDITING]: 'Edit Monitor',
};

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

const MonitorDrawer = (props: MonitorDrawerProps) => {
  const { credentials, groups, mode, monitor, onClose, onSubmit, open } = props;

  const credentialOptions = getCredentialOptions(credentials);
  const groupOptions = getGroupsOptions(groups);

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

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title={titleMap[mode]}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
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
                required={mode === modes.CREATING}
                value={values.label}
              />

              <Select
                onChange={(_, item: SelectOption<ServiceType>) =>
                  setFieldValue(
                    'consultation_group',
                    item === null ? '' : item.value
                  )
                }
                textFieldProps={{
                  tooltipText: helperText.consultation_group,
                }}
                value={getValueFromItem(
                  values.consultation_group || '',
                  groupOptions
                )}
                clearable
                data-qa-add-consultation-group
                errorText={errors.consultation_group}
                label="Contact Group"
                onBlur={handleBlur}
                options={groupOptions}
                placeholder="Select a group..."
                searchable
              />

              <Grid container spacing={2}>
                <Grid
                  size={{
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <Select
                    onChange={(_, item: SelectOption<ServiceType>) =>
                      setFieldValue('service_type', item.value)
                    }
                    textFieldProps={{
                      required: mode === modes.CREATING,
                    }}
                    data-qa-add-service-type
                    errorText={errors.service_type}
                    label="Monitor Type"
                    onBlur={handleBlur}
                    options={typeOptions}
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">seconds</InputAdornment>
                      ),
                    }}
                    data-qa-add-timeout
                    error={!!errors.timeout}
                    errorText={errors.timeout}
                    label="Response Timeout"
                    name="timeout"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required={mode === modes.CREATING}
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
                required={mode === modes.CREATING}
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
                onChange={(_, items: SelectOption<number>[] | null) => {
                  setFieldValue(
                    'credentials',
                    items?.map((thisItem) => thisItem.value) || []
                  );
                }}
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
                data-qa-add-credentials
                errorText={errors.credentials}
                label="Credentials"
                multiple
                onBlur={handleBlur}
                options={credentialOptions}
              />
              <ActionsPanel
                primaryButtonProps={{
                  'data-testid': 'submit',
                  label: mode === 'create' ? 'Add Monitor' : 'Save Changes',
                  loading: isSubmitting,
                  onClick: () => handleSubmit(),
                }}
                secondaryButtonProps={{
                  'data-testid': 'cancel',
                  label: 'Cancel',
                  onClick: onClose,
                }}
              />
            </form>
          </>
        )}
      </Formik>
    </Drawer>
  );
};

export default MonitorDrawer;
