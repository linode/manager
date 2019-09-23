import { Formik } from 'formik';
import {
  createServiceMonitorSchema,
  ManagedCredential,
  ManagedServiceMonitor,
  ManagedServicePayload,
  ServiceType
} from 'linode-js-sdk/lib/managed';
import { pickBy } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import InputAdornment from 'src/components/core/InputAdornment';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

export interface Props {
  mode: 'create' | 'edit';
  open: boolean;
  credentials: ManagedCredential[];
  groups: string[];
  label?: string;
  successMsg?: string;
  monitor?: ManagedServiceMonitor;
  onClose: () => void;
  onSubmit: (values: ManagedServicePayload, formikProps: any) => void;
}

type CombinedProps = Props;

export const modes = {
  CREATING: 'create',
  EDITING: 'edit'
};

const titleMap = {
  [modes.CREATING]: 'Add a Monitor',
  [modes.EDITING]: 'Edit Monitor'
};

const typeOptions: Item<ServiceType>[] = [
  {
    value: 'url',
    label: 'URL'
  },
  {
    value: 'tcp',
    label: 'TCP'
  }
];

const getCredentialOptions = (
  credentials: ManagedCredential[]
): Item<number>[] => {
  return credentials.map(thisCredential => {
    return {
      value: thisCredential.id,
      label: thisCredential.label
    };
  });
};

const getGroupsOptions = (groups: string[]): Item<string>[] => {
  return groups.map(thisGroup => ({
    value: thisGroup,
    label: thisGroup
  }));
};

const helperText = {
  consultation_group:
    "If we need help along the way, we'll contact someone from this group.",
  url: 'The URL to request.',
  body: 'Response must contain this string or an alert will be triggered.',
  credentials:
    'Any additional credentials required for incident response or routine maintenance.'
};

const getValueFromItem = (value: string, options: Item<any>[]) => {
  return options.find(thisOption => thisOption.value === value);
};

const getMultiValuesFromItems = (values: number[], options: Item<any>[]) => {
  return options.filter(thisOption => values.includes(thisOption.value));
};

const emptyInitialValues = {
  label: '',
  consultation_group: '',
  credentials: [],
  service_type: 'url',
  address: '',
  body: '',
  timeout: 10,
  notes: ''
} as ManagedServicePayload;

const MonitorDrawer: React.FC<CombinedProps> = props => {
  const { credentials, groups, mode, monitor, open, onClose, onSubmit } = props;

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
    <Drawer title={titleMap[mode]} open={open} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={createServiceMonitorSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={onSubmit}
      >
        {({
          values,
          errors,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue
        }) => (
          <>
            {status && (
              <Notice
                key={status}
                text={status.generalError}
                error
                data-qa-error
              />
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                name="label"
                label="Monitor Label"
                data-qa-add-label
                value={values.label}
                error={!!errors.label}
                errorText={errors.label}
                onChange={handleChange}
                onBlur={handleBlur}
                required={mode === modes.CREATING}
              />

              <Select
                name="consultation_group"
                label="Contact Group"
                placeholder="Select a group..."
                isClearable
                data-qa-add-consultation-group
                value={getValueFromItem(
                  values.consultation_group || '',
                  groupOptions
                )}
                options={groupOptions}
                errorText={errors.consultation_group}
                onChange={(item: Item<ServiceType>) =>
                  setFieldValue(
                    'consultation_group',
                    item === null ? '' : item.value
                  )
                }
                onBlur={handleBlur}
                textFieldProps={{
                  tooltipText: helperText.consultation_group
                }}
              />

              <Grid container>
                <Grid item xs={12} sm={6}>
                  <Select
                    name="service_type"
                    label="Monitor Type"
                    isClearable={false}
                    data-qa-add-service-type
                    options={typeOptions}
                    value={getValueFromItem(values.service_type, typeOptions)}
                    errorText={errors.service_type}
                    onChange={(item: Item<ServiceType>) =>
                      setFieldValue('service_type', item.value)
                    }
                    onBlur={handleBlur}
                    textFieldProps={{
                      required: mode === modes.CREATING
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="timeout"
                    label="Response Timeout"
                    type="number"
                    data-qa-add-timeout
                    value={values.timeout}
                    error={!!errors.timeout}
                    errorText={errors.timeout}
                    onChange={handleChange}
                    required={mode === modes.CREATING}
                    onBlur={handleBlur}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">seconds</InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                name="address"
                label="URL"
                data-qa-add-address
                value={values.address}
                error={!!errors.address}
                errorText={errors.address}
                tooltipText={helperText.url}
                onChange={handleChange}
                onBlur={handleBlur}
                required={mode === modes.CREATING}
              />
              <TextField
                name="body"
                label="Response Body Match"
                data-qa-add-body
                value={values.body}
                error={!!errors.body}
                tooltipText={helperText.body}
                errorText={errors.body}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <TextField
                multiline
                name="notes"
                label="Instructions / Notes"
                data-qa-add-notes
                value={values.notes}
                error={!!errors.notes}
                errorText={errors.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Select
                name="credentials"
                placeholder="None Required"
                isMulti
                isClearable={false}
                label="Credentials"
                data-qa-add-credentials
                options={credentialOptions}
                value={getMultiValuesFromItems(
                  values.credentials || [],
                  credentialOptions
                )}
                errorText={errors.credentials}
                textFieldProps={{
                  tooltipText: helperText.credentials
                }}
                onChange={(items: Item<number>[]) => {
                  setFieldValue(
                    'credentials',
                    items.map(thisItem => thisItem.value)
                  );
                }}
                onBlur={handleBlur}
              />
              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={() => handleSubmit()}
                  loading={isSubmitting}
                  data-qa-submit
                >
                  {mode === 'create' ? 'Add' : 'Update'}
                </Button>
                <Button
                  onClick={onClose}
                  data-qa-cancel
                  buttonType="secondary"
                  className="cancel"
                >
                  Cancel
                </Button>
              </ActionsPanel>
            </form>
          </>
        )}
      </Formik>
    </Drawer>
  );
};

export default MonitorDrawer;
