import { Formik } from 'formik';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
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
  root: {},
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
  onClose: () => void;
  onSubmit: (values: ManagedServicePayload, formikProps: any) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const modes = {
  CREATING: 'create',
  EDITING: 'edit'
};

const titleMap = {
  [modes.CREATING]: 'Add a Monitor',
  [modes.EDITING]: 'Edit a Monitor'
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

const getValueFromItem = (
  value: string,
  options: Item<Linode.ServiceType>[]
) => {
  return options.find(thisOption => thisOption.value === value);
};

const MonitorDrawer: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { mode, open, onClose, onSubmit } = props;

  return (
    <Drawer title={titleMap[mode]} open={open} onClose={onClose}>
      <Formik
        initialValues={{
          label: '',
          consultation_group: '',
          service_type: 'url',
          address: '',
          body: '',
          timeout: 10
        }}
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
              <Notice key={status} text={status} error data-qa-error />
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                name="label"
                label="Label"
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
                data-qa-add-label
                value={values.consultation_group}
                error={!!errors.consultation_group}
                errorText={errors.consultation_group}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className={classes.box}>
                <Select
                  className={classes.smallInput}
                  name="service_type"
                  label="Monitor Type"
                  isClearable={false}
                  data-qa-add-label
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
                  data-qa-add-label
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
                data-qa-add-label
                value={values.address}
                error={!!errors.address}
                errorText={errors.address}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <TextField
                name="body"
                label="Response Body Match"
                data-qa-add-label
                value={values.body}
                error={!!errors.body}
                errorText={errors.body}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <TextField
                multiline
                name="notes"
                label="Instructions / Notes"
                data-qa-add-label
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
                data-qa-add-label
                options={credentialOptions}
                value={credentialOptions[0]}
                errorText={errors.credentials}
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
                  Submit
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

export default compose<CombinedProps, Props>(withRouter)(MonitorDrawer);
