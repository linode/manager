import { CreateFirewallPayload } from '@linode/api-v4/lib/firewalls';
import { CreateFirewallSchema } from '@linode/validation/lib/firewalls.schema';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useCreateFirewall } from 'src/queries/firewalls';
import { useGrants } from 'src/queries/profile';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { getEntityIdsByPermission } from 'src/utilities/grants';

export const READ_ONLY_LINODES_HIDDEN_MESSAGE =
  'Only Linodes you have permission to modify are shown.';

export interface CreateFirewallDrawerProps {
  onClose: () => void;
  open: boolean;
}

const initialValues: CreateFirewallPayload = {
  devices: {
    linodes: [],
  },
  label: '',
  rules: {
    inbound_policy: 'ACCEPT',
    outbound_policy: 'ACCEPT',
  },
};

export const CreateFirewallDrawer = React.memo(
  (props: CreateFirewallDrawerProps) => {
    const { onClose, open } = props;

    /**
     * We'll eventually want to check the read_write firewall
     * grant here too, but it doesn't exist yet.
     */
    const { _hasGrant, _isRestrictedUser } = useAccountManagement();
    const { data: grants } = useGrants();

    const { mutateAsync } = useCreateFirewall();

    const {
      errors,
      handleBlur,
      handleChange,
      handleSubmit,
      isSubmitting,
      resetForm,
      setFieldValue,
      status,
      values,
    } = useFormik({
      initialValues,
      onSubmit(
        values: CreateFirewallPayload,
        { setErrors, setStatus, setSubmitting }
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
      validateOnBlur: false,
      validateOnChange: false,
      validationSchema: CreateFirewallSchema,
    });

    React.useEffect(() => {
      if (open) {
        resetForm();
      }
    }, [open]);

    const userCannotAddFirewall =
      _isRestrictedUser && !_hasGrant('add_firewalls');

    // If a user is restricted, they can not add a read-only Linode to a firewall.
    const readOnlyLinodeIds = _isRestrictedUser
      ? getEntityIdsByPermission(grants, 'linode', 'read_only')
      : [];

    const linodeSelectGuidance =
      readOnlyLinodeIds.length > 0
        ? READ_ONLY_LINODES_HIDDEN_MESSAGE
        : undefined;

    const firewallHelperText = `Assign one or more Linodes to this firewall. You can add Linodes later if you want to customize your rules first. ${
      linodeSelectGuidance ? linodeSelectGuidance : ''
    }`;

    const generalError =
      status?.generalError ||
      errors['rules.inbound'] ||
      errors['rules.outbound'] ||
      errors.rules;

    return (
      <Drawer onClose={onClose} open={open} title="Create Firewall">
        <form onSubmit={handleSubmit}>
          {userCannotAddFirewall ? (
            <Notice
              variant="error"
              text="You don't have permissions to create a new Firewall. Please contact an account administrator for details."
            />
          ) : null}
          {generalError && (
            <Notice
              data-qa-error
              key={status}
              variant="error"
              text={status?.generalError ?? 'An unexpected error occurred'}
            />
          )}
          <TextField
            inputProps={{
              autoFocus: true,
            }}
            aria-label="Label for your new Firewall"
            disabled={userCannotAddFirewall}
            errorText={errors.label}
            label="Label"
            name="label"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.label}
          />
          <LinodeSelect
            onSelectionChange={(selected) =>
              setFieldValue(
                'devices.linodes',
                selected.map((linode) => linode.id)
              )
            }
            disabled={userCannotAddFirewall}
            errorText={errors['devices.linodes']}
            helperText={firewallHelperText}
            multiple
            onBlur={handleBlur}
            optionsFilter={(linode) => !readOnlyLinodeIds.includes(linode.id)}
            value={values.devices?.linodes ?? []}
          />
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: userCannotAddFirewall,
              label: 'Create Firewall',
              loading: isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        </form>
      </Drawer>
    );
  }
);
