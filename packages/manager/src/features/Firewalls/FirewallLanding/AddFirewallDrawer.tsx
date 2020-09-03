import { Formik, FormikBag } from 'formik';
import {
  CreateFirewallPayload,
  CreateFirewallSchema,
  Firewall
} from '@linode/api-v4/lib/firewalls';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Drawer, { DrawerProps } from 'src/components/Drawer';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import { predefinedFirewalls } from '../shared';

/* tslint:disable-next-line */
interface Props extends Omit<DrawerProps, 'onClose' | 'onSubmit'> {
  onClose: () => void;
  onSubmit: (payload: CreateFirewallPayload) => Promise<Firewall>;
}

export type FormikProps = FormikBag<CombinedProps, CreateFirewallPayload>;

type CombinedProps = Props;

const initialValues: CreateFirewallPayload = {
  label: '',
  rules: {
    inbound: [
      ...predefinedFirewalls.ssh.inbound,
      ...predefinedFirewalls.dns.inbound
    ]
  },
  devices: {
    linodes: []
  }
};

const AddFirewallDrawer: React.FC<CombinedProps> = props => {
  const { onClose, onSubmit, ...restOfDrawerProps } = props;

  const submitForm = (
    values: CreateFirewallPayload,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    // Clear drawer error state
    setStatus(undefined);
    setErrors({});

    if (values.label === '') {
      values.label = undefined;
    }

    if (
      Array.isArray(values.rules.inbound) &&
      values.rules.inbound.length === 0
    ) {
      values.rules.inbound = undefined;
    }

    if (
      Array.isArray(values.rules.outbound) &&
      values.rules.outbound.length === 0
    ) {
      values.rules.outbound = undefined;
    }

    onSubmit(values)
      .then(() => {
        setSubmitting(false);
        onClose();
      })
      .catch(err => {
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, err);
        handleGeneralErrors(mapErrorToStatus, err, 'Error creating Firewall.');
      });
  };

  return (
    <Drawer {...restOfDrawerProps} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={CreateFirewallSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={submitForm}
      >
        {({
          values,
          errors,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          validateField
        }) => {
          const generalError =
            status?.generalError ||
            errors['rules.inbound'] ||
            errors['rules.outbound'] ||
            errors.rules;

          return (
            <form onSubmit={handleSubmit}>
              {generalError && (
                <Notice
                  key={status}
                  text={status?.generalError ?? 'An unexpected error occurred'}
                  error
                  data-qa-error
                />
              )}
              <Typography>
                Firewalls are created with default rules to allow inbound SSH
                (port 22) and DNS (port 53) traffic. You can edit these rules or
                add additional rules once the Firewall has been created.
              </Typography>
              <TextField
                aria-label="Label for your new Firewall"
                label="Label"
                name="label"
                value={values.label}
                onChange={handleChange}
                errorText={errors.label}
                onBlur={handleBlur}
                inputProps={{
                  autoFocus: true
                }}
              />
              <LinodeMultiSelect
                showAllOption
                helperText="Assign one or more Linodes to this firewall. You can add Linodes later if you want to customize your rules first."
                errorText={errors['devices.linodes']}
                handleChange={(selected: number[]) =>
                  setFieldValue('devices.linodes', selected)
                }
                onBlur={handleBlur}
              />
              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={() => handleSubmit()}
                  data-qa-submit
                  loading={isSubmitting}
                >
                  Create
                </Button>
                <Button onClick={onClose} buttonType="cancel" data-qa-cancel>
                  Cancel
                </Button>
              </ActionsPanel>
            </form>
          );
        }}
      </Formik>
    </Drawer>
  );
};

export default compose<CombinedProps, Props>(React.memo)(AddFirewallDrawer);
