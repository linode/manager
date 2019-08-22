import { Formik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  createServiceMonitorSchema,
  ManagedServicePayload
} from 'src/services/managed';

const useStyles = makeStyles((theme: Theme) => ({
  smallInput: {
    width: '12em',
    marginRight: theme.spacing(1)
  },
  actionPanel: {
    marginTop: theme.spacing(2)
  },
  box: {
    display: 'flex',
    flexFlow: 'row nowrap'
  }
}));

export interface Props {
  mode: 'create' | 'edit';
  open: boolean;
  label?: string;
  successMsg?: string;
  monitor?: Linode.ManagedServiceMonitor;
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

const typeOptions: Item<Linode.ServiceType>[] = [
  {
    value: 'url',
    label: 'URL'
  },
  {
    value: 'tcp',
    label: 'TCP'
  }
];

const credentialOptions: Item<string>[] = [
  {
    value: 'none',
    label: 'None required'
  }
];

const helperText = {
  consultation_group:
    "If we need help along the way, we'll contact someone from this group.",
  url: 'The URL to request.',
  body: 'Response must contain this string or an alert will be triggered.',
  credentials:
    'Any additional credentials required for incident response or routine maintenance.'
};

const getValueFromItem = (
  value: string,
  options: Item<Linode.ServiceType>[]
) => {
  return options.find(thisOption => thisOption.value === value);
};

const emptyInitialValues = {
  label: '',
  consultation_group: '',
  service_type: 'url',
  address: '',
  body: '',
  timeout: 10
} as ManagedServicePayload;

const MonitorDrawer: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { mode, monitor, open, onClose, onSubmit } = props;

  const initialValues = {...emptyInitialValues, ...monitor};

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
              />

              <TextField
                name="consultation_group"
                label="Contact Group"
                data-qa-add-consultation-group
                value={values.consultation_group}
                error={!!errors.consultation_group}
                errorText={errors.consultation_group}
                onChange={handleChange}
                onBlur={handleBlur}
                tooltipText={helperText.consultation_group}
              />

              <div className={classes.box}>
                <Select
                  className={classes.smallInput}
                  name="service_type"
                  label="Monitor Type"
                  isClearable={false}
                  data-qa-add-service-type
                  options={typeOptions}
                  value={getValueFromItem(values.service_type, typeOptions)}
                  errorText={errors.service_type}
                  onChange={(item: Item<Linode.ServiceType>) =>
                    setFieldValue('service_type', item.value)
                  }
                  onBlur={handleBlur}
                />
                <TextField
                  className={classes.smallInput}
                  name="timeout"
                  label="Response Timeout (Seconds)"
                  data-qa-add-timeout
                  value={values.timeout}
                  error={!!errors.timeout}
                  errorText={errors.timeout}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

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
              <Select // @todo this is a dummy select atm
                name="credentials"
                isClearable={false}
                label="Credentials"
                data-qa-add-credentials
                options={credentialOptions}
                value={credentialOptions[0]}
                errorText={errors.credentials}
                textFieldProps={{
                  tooltipText: helperText.credentials
                }}
                onChange={(item: Item<Linode.ServiceType>) =>
                  setFieldValue('credentials', item.value)
                }
                onBlur={handleBlur}
              />
              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={() => handleSubmit()}
                  loading={isSubmitting}
                  data-qa-submit
                >
                  Add
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
