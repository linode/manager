import { CreateFirewallPayload } from '@linode/api-v4/lib/firewalls';
import { CreateFirewallSchema } from '@linode/validation/lib/firewalls.schema';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect/LinodeMultiSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useGrants } from 'src/queries/profile';
import { getEntityIdsByPermission } from 'src/utilities/grants';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { useCreateFirewall } from 'src/queries/firewalls';

export const READ_ONLY_LINODES_HIDDEN_MESSAGE =
  'Only Linodes you have permission to modify are shown.';

export interface Props {
  onClose: () => void;
  open: boolean;
}

const initialValues: CreateFirewallPayload = {
  label: '',
  rules: {
    inbound_policy: 'ACCEPT',
    outbound_policy: 'ACCEPT',
  },
  devices: {
    linodes: [],
  },
};

const CreateFirewallDrawer = (props: Props) => {
  const { onClose, open } = props;

  /**
   * We'll eventually want to check the read_write firewall
   * grant here too, but it doesn't exist yet.
   */
  const { _isRestrictedUser, _hasGrant } = useAccountManagement();
  const { data: grants } = useGrants();

  const { mutateAsync } = useCreateFirewall();

  const {
    values,
    errors,
    status,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue,
  } = useFormik({
    initialValues,
    validationSchema: CreateFirewallSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit(
      values: CreateFirewallPayload,
      { setSubmitting, setErrors, setStatus }
    ) {
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

      mutateAsync(payload)
        .then(() => {
          setSubmitting(false);
          onClose();
        })
        .catch((err) => {
          const mapErrorToStatus = () =>
            setStatus({ generalError: getErrorMap([], err).none });

          setSubmitting(false);
          handleFieldErrors(setErrors, err);
          handleGeneralErrors(
            mapErrorToStatus,
            err,
            'Error creating Firewall.'
          );
        });
    },
  });

  const userCannotAddFirewall =
    _isRestrictedUser && !_hasGrant('add_firewalls');

  // If a user is restricted, they can not add a read-only Linode to a firewall.
  const readOnlyLinodeIds = _isRestrictedUser
    ? getEntityIdsByPermission(grants, 'linode', 'read_only')
    : [];

  const linodeSelectGuidance =
    readOnlyLinodeIds.length > 0 ? READ_ONLY_LINODES_HIDDEN_MESSAGE : undefined;

  const firewallHelperText = `Assign one or more Linodes to this firewall. You can add Linodes later if you want to customize your rules first. ${
    linodeSelectGuidance ? linodeSelectGuidance : ''
  }`;

  const generalError =
    status?.generalError ||
    errors['rules.inbound'] ||
    errors['rules.outbound'] ||
    errors.rules;

  return (
    <Drawer open={open} onClose={onClose} title="Create Firewall">
      <form onSubmit={handleSubmit}>
        {userCannotAddFirewall ? (
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
        <TextField
          aria-label="Label for your new Firewall"
          label="Label"
          disabled={userCannotAddFirewall}
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
          disabled={userCannotAddFirewall}
          helperText={firewallHelperText}
          errorText={errors['devices.linodes']}
          onChange={(selected: number[]) =>
            setFieldValue('devices.linodes', selected)
          }
          value={values.devices?.linodes ?? []}
          filteredLinodes={readOnlyLinodeIds}
          onBlur={handleBlur}
        />
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            type="submit"
            disabled={userCannotAddFirewall}
            loading={isSubmitting}
            data-qa-submit
            data-testid="create-firewall-submit"
          >
            Create Firewall
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export default React.memo(CreateFirewallDrawer);
