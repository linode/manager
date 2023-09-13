import {
  CreateFirewallPayload,
  FirewallDeviceEntityType,
} from '@linode/api-v4/lib/firewalls';
import { Linode } from '@linode/api-v4/lib/linodes';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { CreateFirewallSchema } from '@linode/validation/lib/firewalls.schema';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
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

import { FirewallNodeBalancerSelect } from './FirewallNodeBalancerSelect';

export const READ_ONLY_LINODES_HIDDEN_MESSAGE =
  'Only Linodes you have permission to modify are shown.';
import { formattedTypes } from '../FirewallDetail/Devices/FirewallDeviceLanding';

export const READ_ONLY_DEVICES_HIDDEN_MESSAGE = (
  deviceType: FirewallDeviceEntityType
) =>
  `Only ${formattedTypes[deviceType]}s you have permission to modify are shown.`;

// export const READ_ONLY_DEVICES_HIDDEN_MESSAGE = 'Only Devices you have permission to modify are shown.';
export interface CreateFirewallDrawerProps {
  onClose: () => void;
  open: boolean;
}

const initialValues: CreateFirewallPayload = {
  devices: {
    linodes: [],
    nodebalancers: [],
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

    const [chosenLinodeRegion, setChosenLinodeRegion] = React.useState(
      new Set()
    );
    const [selectedNodeBalancers, setSelectedNodeBalancers] = React.useState<
      NodeBalancer[]
    >([]);

    const handleLinodeChange = (selected: Linode[] = []) => {
      if (selected.length > 0) {
        setFieldValue(
          'devices.linodes',
          selected.map((linode) => linode.id)
        );
        const newSet = new Set();
        selected.map((linode) => {
          newSet.add(linode.region);
          return setChosenLinodeRegion(new Set(newSet));
        });
      }
      if (selected.length <= 0) {
        setSelectedNodeBalancers([]);
        setFieldValue('devices', {
          linodes: [],
          nodebalancers: selectedNodeBalancers,
        });
        setChosenLinodeRegion(new Set());
      }
    };

    const handleNodeBalancerChange = (selected: NodeBalancer[]) => {
      if (selected.length > 0) {
        setSelectedNodeBalancers(selected.map((nodebalancer) => nodebalancer));
        setFieldValue(
          'devices.nodebalancers',
          selected.map((nodebalancer) => nodebalancer.id)
        );
      }
      if (selected.length <= 0) {
        setSelectedNodeBalancers([]);
        setFieldValue('devices.nodebalancers', selectedNodeBalancers);
      }
    };

    const userCannotAddFirewall =
      _isRestrictedUser && !_hasGrant('add_firewalls');

    // If a user is restricted, they can not add a read-only Linode to a firewall.
    const readOnlyLinodeIds = _isRestrictedUser
      ? getEntityIdsByPermission(grants, 'linode', 'read_only')
      : [];

    // If a user is restricted, they can not add a read-only NodeBalancer to a firewall.
    const readOnlyNodebalancerIds = _isRestrictedUser
      ? getEntityIdsByPermission(grants, 'nodebalancer', 'read_only')
      : [];

    const deviceSelectGuidance =
      readOnlyLinodeIds.length > 0 || readOnlyNodebalancerIds.length > 0
        ? // ? READ_ONLY_DEVICES_HIDDEN_MESSAGE
          // const linodeSelectGuidance =
          // readOnlyLinodeIds.length > 0
          READ_ONLY_DEVICES_HIDDEN_MESSAGE('linode')
        : undefined;

    const firewallLabelText = `Assign devices to the Firewall.`;

    const firewallHelperText = `Assign one or more devices to this firewall. You can add devices later if you want to customize your rules first. ${
      deviceSelectGuidance ? deviceSelectGuidance : ''
    }`;

    const nodebalancerHelperText = `Only the Firewall's inbound rules apply to NodeBalancers.`;

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
              text="You don't have permissions to create a new Firewall. Please contact an account administrator for details."
              variant="error"
            />
          ) : null}
          {generalError && (
            <Notice
              data-qa-error
              key={status}
              text={status?.generalError ?? 'An unexpected error occurred'}
              variant="error"
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
          <Box>
            <Typography
              sx={(theme) => ({
                margin: `${theme.spacing(2)} ${theme.spacing(0)}`,
              })}
              variant="h3"
            >
              {firewallLabelText}
            </Typography>
            <Typography> {firewallHelperText}</Typography>
            <Typography
              sx={(theme) => ({
                margin: `${theme.spacing(2)} ${theme.spacing(0)}`,
              })}
            >
              {nodebalancerHelperText}
            </Typography>
          </Box>
          <LinodeSelect
            disabled={userCannotAddFirewall}
            errorText={errors['devices.linodes']}
            multiple
            onBlur={handleBlur}
            onSelectionChange={handleLinodeChange}
            optionsFilter={(linode) => !readOnlyLinodeIds.includes(linode.id)}
            value={values.devices?.linodes ?? []}
          />
          <FirewallNodeBalancerSelect
            optionsFilter={(nodebalancer) =>
              chosenLinodeRegion.has(nodebalancer.region) &&
              !readOnlyNodebalancerIds.includes(nodebalancer.id)
            }
            errorText={errors['devices.nodebalancers']}
            multiple
            onBlur={handleBlur}
            onSelectionChange={handleNodeBalancerChange}
            value={values?.devices?.nodebalancers ?? []}
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
