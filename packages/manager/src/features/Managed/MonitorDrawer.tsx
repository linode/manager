import {
  ManagedCredential,
  ManagedServiceMonitor,
  ManagedServicePayload,
  ServiceType,
} from '@linode/api-v4/lib/managed';
import { createServiceMonitorSchema } from '@linode/validation/lib/managed.schema';
import Grid from '@mui/material/Unstable_Grid2';
import { Formik } from 'formik';
import { pickBy } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { InputAdornment } from 'src/components/InputAdornment';

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

const typeOptions: Item<ServiceType>[] = [
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
): Item<number>[] => {
  return credentials.map((thisCredential) => {
    return {
      label: thisCredential.label,
      value: thisCredential.id,
    };
  });
};

const getGroupsOptions = (groups: string[]): Item<string>[] => {
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

const getValueFromItem = (value: string, options: Item<any>[]) => {
  return options.find((thisOption) => thisOption.value === value);
};

const getMultiValuesFromItems = (values: number[], options: Item<any>[]) => {
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
  const _monitor = pickBy(
    (val, key) => val !== null && Object.keys(emptyInitialValues).includes(key),
    monitor
  ) as ManagedServicePayload;

  const initialValues = { ...emptyInitialValues, ..._monitor };

  return (
    <Drawer onClose={onClose} open={open} title={titleMap[mode]}>
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
                onChange={(item: Item<ServiceType>) =>
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
                data-qa-add-consultation-group
                errorText={errors.consultation_group}
                isClearable
                label="Contact Group"
                name="consultation_group"
                onBlur={handleBlur}
                options={groupOptions}
                placeholder="Select a group..."
              />

              <Grid container spacing={2}>
                <Grid sm={6} xs={12}>
                  <Select
                    onChange={(item: Item<ServiceType>) =>
                      setFieldValue('service_type', item.value)
                    }
                    textFieldProps={{
                      required: mode === modes.CREATING,
                    }}
                    data-qa-add-service-type
                    errorText={errors.service_type}
                    isClearable={false}
                    label="Monitor Type"
                    name="service_type"
                    onBlur={handleBlur}
                    options={typeOptions}
                    value={getValueFromItem(values.service_type, typeOptions)}
                  />
                </Grid>
                <Grid sm={6} xs={12}>
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
              <Select
                onChange={(items: Item<number>[]) => {
                  setFieldValue(
                    'credentials',
                    items.map((thisItem) => thisItem.value)
                  );
                }}
                textFieldProps={{
                  tooltipText: helperText.credentials,
                }}
                value={getMultiValuesFromItems(
                  values.credentials || [],
                  credentialOptions
                )}
                data-qa-add-credentials
                errorText={errors.credentials}
                isClearable={false}
                isMulti
                label="Credentials"
                name="credentials"
                onBlur={handleBlur}
                options={credentialOptions}
                placeholder="None Required"
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
