import { Formik, FormikBag } from 'formik';
import {
  CreateFirewallPayload,
  CreateFirewallSchema,
  Firewall,
} from '@linode/api-v4/lib/firewalls';
import { Capabilities } from '@linode/api-v4/lib/regions/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Drawer, { DrawerProps } from 'src/components/Drawer';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useRegionsQuery } from 'src/queries/regions';
import arrayToList from 'src/utilities/arrayToCommaSeparatedList';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { predefinedFirewalls } from '../shared';

export interface Props extends Omit<DrawerProps, 'onClose' | 'onSubmit'> {
  onClose: () => void;
  onSubmit: (payload: CreateFirewallPayload) => Promise<Firewall>;
}

export type FormikProps = FormikBag<CombinedProps, CreateFirewallPayload>;

export type CombinedProps = Props;

const initialValues: CreateFirewallPayload = {
  label: '',
  rules: {
    inbound_policy: 'DROP',
    outbound_policy: 'ACCEPT',
    inbound: [
      ...predefinedFirewalls.ssh.inbound,
      ...predefinedFirewalls.dns.inbound,
    ],
  },
  devices: {
    linodes: [],
  },
};

const AddFirewallDrawer: React.FC<CombinedProps> = props => {
  const { onClose, onSubmit, ...restOfDrawerProps } = props;

  /**
   * We'll eventually want to check the read_write firewall
   * grant here too, but it doesn't exist yet.
   */
  const { _isRestrictedUser } = useAccountManagement();

  const regions = useRegionsQuery().data ?? [];

  const regionsWithFirewalls = regions
    .filter(thisRegion =>
      thisRegion.capabilities.includes('Cloud Firewall' as Capabilities)
    )
    .map(thisRegion => thisRegion.id);

  const submitForm = (
    values: CreateFirewallPayload,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    // Clear drawer error state
    setStatus(undefined);
    setErrors({});
    const payload = { ...values };

    if (payload.label === '') {
      payload.label = undefined;
    }

    if (
      Array.isArray(payload.rules.inbound) &&
      payload.rules.inbound.length === 0
    ) {
      payload.rules.inbound = undefined;
    }

    if (
      Array.isArray(payload.rules.outbound) &&
      payload.rules.outbound.length === 0
    ) {
      payload.rules.outbound = undefined;
    }

    onSubmit(payload)
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
        }) => {
          const generalError =
            status?.generalError ||
            errors['rules.inbound'] ||
            errors['rules.outbound'] ||
            errors.rules;

          return (
            <form onSubmit={handleSubmit}>
              {_isRestrictedUser ? (
                <Notice
                  error
                  text="You don't have permissions to create a new Firewall. Please contact an account administrator for details."
                />
              ) : null}
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
                disabled={_isRestrictedUser}
                name="label"
                value={values.label}
                onChange={handleChange}
                errorText={errors.label}
                onBlur={handleBlur}
                inputProps={{
                  autoFocus: true,
                }}
              />
              <LinodeMultiSelect
                showAllOption
                disabled={_isRestrictedUser}
                allowedRegions={regionsWithFirewalls}
                helperText={`Assign one or more Linodes to this firewall. You can add
                 Linodes later if you want to customize your rules first. Only Linodes in
                 regions that support Firewalls (${arrayToList(
                   regionsWithFirewalls.map(thisId => dcDisplayNames[thisId])
                 )}) will be displayed as options.`}
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
                  data-testid="add-firewall-submit"
                  loading={isSubmitting}
                  disabled={_isRestrictedUser}
                >
                  Create
                </Button>
                <Button
                  onClick={onClose}
                  buttonType="cancel"
                  disabled={_isRestrictedUser}
                  data-qa-cancel
                >
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

export default React.memo(AddFirewallDrawer);
