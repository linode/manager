/* eslint-disable jsx-a11y/anchor-is-valid */
import { Linode } from '@linode/api-v4';
import {
  CreateFirewallPayload,
  Firewall,
  FirewallDeviceEntityType,
} from '@linode/api-v4/lib/firewalls';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { CreateFirewallSchema } from '@linode/validation/lib/firewalls.schema';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { NodeBalancerSelect } from 'src/features/NodeBalancers/NodeBalancerSelect';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { useCreateFirewall } from 'src/queries/firewalls';
import { useAllFirewallsQuery } from 'src/queries/firewalls';
import { queryKey as linodesQueryKey } from 'src/queries/linodes/linodes';
import { queryKey as nodebalancerQueryKey } from 'src/queries/nodebalancers';
import { useGrants } from 'src/queries/profile';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { getEntityIdsByPermission } from 'src/utilities/grants';

// const FIREWALL_LABEL_TEXT = `Assign services to the firewall.`;
// const FIREWALL_HELPER_TEXT = `Assign one or more services to this firewall. You can add services later if you want to customize your rules first.`;
const NODEBALANCER_HELPER_TEXT = `Only the firewall's inbound rules apply to NodeBalancers.`;
export const READ_ONLY_DEVICES_HIDDEN_MESSAGE =
  'Only services you have permission to modify are shown.';

export const LINODE_CREATE_FLOW_TEXT = 'Additional Linodes';
export const NODEBALANCER_CREATE_FLOW_TEXT = 'Additional NodeBalancers';

export interface CreateFirewallDrawerProps {
  createFlow?: FirewallDeviceEntityType;
  onClose: () => void;
  onFirewallCreated?: (firewall: Firewall) => void;
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
    // TODO: NBFW - We'll eventually want to check the read_write firewall grant here too, but it doesn't exist yet.
    const flags = useFlags();
    const { createFlow, onClose, onFirewallCreated, open } = props;
    const { _hasGrant, _isRestrictedUser } = useAccountManagement();
    const { data: grants } = useGrants();
    const { mutateAsync } = useCreateFirewall();
    const { data } = useAllFirewallsQuery();

    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

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
          .then((response) => {
            setSubmitting(false);
            enqueueSnackbar(`Firewall ${payload.label} successfully created`, {
              variant: 'success',
            });

            // Invalidate for Linodes
            if (payload.devices?.linodes) {
              payload.devices.linodes.forEach((linodeId) => {
                queryClient.invalidateQueries([
                  linodesQueryKey,
                  'linode',
                  linodeId,
                  'firewalls',
                ]);
              });
            }

            // Invalidate for NodeBalancers
            if (payload.devices?.nodebalancers) {
              payload.devices.nodebalancers.forEach((nodebalancerId) => {
                queryClient.invalidateQueries([
                  nodebalancerQueryKey,
                  'nodebalancer',
                  nodebalancerId,
                  'firewalls',
                ]);
              });
            }

            if (onFirewallCreated) {
              onFirewallCreated(response);
            }
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

    const entityName = flags.firewallNodebalancer ? 'services' : 'Linodes';

    const FirewallLabelText = `Assign ${entityName} to the firewall.`;
    const FirewallHelperText = `Assign one or more ${entityName} to this firewall. You can add ${entityName} later if you want to customize your rules first.`;

    React.useEffect(() => {
      if (open) {
        resetForm();
      }
    }, [open, resetForm]);

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
        ? READ_ONLY_DEVICES_HIDDEN_MESSAGE
        : undefined;

    const [linodeOptionsFilter, nodebalancerOptionsFilter] = (() => {
      // When `firewallNodebalancer` feature flag is disabled, no filtering
      // occurs. In this case, pass filter callbacks that always returns `true`.
      if (!flags.firewallNodebalancer) {
        return [() => true, () => true];
      }

      const assignedServices = data
        ?.map((firewall) => firewall.entities)
        .flat();

      const assignedLinodes = assignedServices?.filter(
        (service) => service.type === 'linode'
      );
      const assignedNodeBalancers = assignedServices?.filter(
        (service) => service.type === 'nodebalancer'
      );

      const linodeOptionsFilter = (linode: Linode) => {
        return (
          !readOnlyLinodeIds.includes(linode.id) &&
          !assignedLinodes?.some((service) => service.id === linode.id)
        );
      };

      const nodebalancerOptionsFilter = (nodebalancer: NodeBalancer) => {
        return (
          !readOnlyNodebalancerIds.includes(nodebalancer.id) &&
          !assignedNodeBalancers?.some(
            (service) => service.id === nodebalancer.id
          )
        );
      };

      return [linodeOptionsFilter, nodebalancerOptionsFilter];
    })();

    const learnMoreLink = (
      <Link to="https://www.linode.com/docs/products/networking/cloud-firewall/#limits-and-considerations">
        Learn more
      </Link>
    );

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
            required
            value={values.label}
          />
          <Box>
            <Typography
              sx={(theme) => ({
                margin: `${theme.spacing(2)} ${theme.spacing(0)}`,
              })}
              variant="h3"
            >
              {FirewallLabelText}
            </Typography>
            <Typography>
              {FirewallHelperText}
              {deviceSelectGuidance ? ` ${deviceSelectGuidance}` : null}
            </Typography>
            {flags.firewallNodebalancer && (
              <Typography
                sx={(theme) => ({
                  margin: `${theme.spacing(2)} ${theme.spacing(0)}`,
                })}
              >
                {NODEBALANCER_HELPER_TEXT}
                <br />
                {learnMoreLink}
              </Typography>
            )}
          </Box>
          <LinodeSelect
            label={
              createFlow === 'linode' ? LINODE_CREATE_FLOW_TEXT : 'Linodes'
            }
            onSelectionChange={(linodes) => {
              setFieldValue(
                'devices.linodes',
                linodes.map((linode) => linode.id)
              );
            }}
            errorText={errors['devices.linodes']}
            helperText={deviceSelectGuidance}
            multiple
            optionsFilter={linodeOptionsFilter}
            value={values.devices?.linodes ?? null}
          />
          {flags.firewallNodebalancer && (
            <NodeBalancerSelect
              label={
                createFlow === 'nodebalancer'
                  ? NODEBALANCER_CREATE_FLOW_TEXT
                  : 'NodeBalancers'
              }
              onSelectionChange={(nodebalancers) => {
                setFieldValue(
                  'devices.nodebalancers',
                  nodebalancers.map((nodebalancer) => nodebalancer.id)
                );
              }}
              errorText={errors['devices.nodebalancers']}
              helperText={deviceSelectGuidance}
              multiple
              optionsFilter={nodebalancerOptionsFilter}
              value={values.devices?.nodebalancers ?? null}
            />
          )}
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
