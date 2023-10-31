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
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useCreateFirewall } from 'src/queries/firewalls';
import { queryKey as linodesQueryKey } from 'src/queries/linodes/linodes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { queryKey as nodebalancerQueryKey } from 'src/queries/nodebalancers';
import { useGrants } from 'src/queries/profile';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { getEntityIdsByPermission } from 'src/utilities/grants';

const FIREWALL_LABEL_TEXT = `Assign services to the firewall.`;
const FIREWALL_HELPER_TEXT = `Assign one or more services to this firewall. You can add services later if you want to customize your rules first.`;
const NODEBALANCER_HELPER_TEXT = `Only the firewall's inbound rules apply to NodeBalancers.`;
export const READ_ONLY_DEVICES_HIDDEN_MESSAGE =
  'Only services you have permission to modify are shown.';

export interface CreateFirewallDrawerProps {
  inCreateFlow?: boolean;
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
    const { inCreateFlow, onClose, onFirewallCreated, open } = props;
    const { _hasGrant, _isRestrictedUser } = useAccountManagement();
    const { data: grants } = useGrants();
    const { mutateAsync } = useCreateFirewall();

    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    // const deviceType = device?.entity.type;

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

        // const querykey = deviceType === 'linode' ? linodesQueryKey : nodeBalancerQueryKey;

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
            enqueueSnackbar('Firewall created successfully.', {
              variant: 'success',
            });
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
    }, [open, resetForm]);

    const {
      data: nodebalancerData,
      error: nodebalancerError,
      isLoading: nodebalancerIsLoading,
    } = useAllNodeBalancersQuery();

    const {
      data: linodeData,
      error: linodeError,
      isLoading: linodeIsLoading,
    } = useAllLinodesQuery();

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
        : null;

    const optionsFilter = (
      id: number,
      serviceType: FirewallDeviceEntityType
    ) => {
      const readOnlyIds =
        serviceType === 'linode' ? readOnlyLinodeIds : readOnlyNodebalancerIds;

      return !readOnlyIds.includes(id);
    };

    const nodebalancers = nodebalancerData?.filter((nb) =>
      optionsFilter(nb.id, 'nodebalancer')
    );

    const linodes = linodeData?.filter((linode) =>
      optionsFilter(linode.id, 'linode')
    );

    const selectedLinodes: Linode[] =
      linodes?.filter((linode) =>
        values.devices?.linodes?.includes(linode.id)
      ) || [];

    const selectedNodeBalancers: NodeBalancer[] =
      nodebalancers?.filter((nodebalancer) =>
        values.devices?.nodebalancers?.includes(nodebalancer.id)
      ) || [];

    // TODO: NBFW - Placeholder until real link is available
    const learnMoreLink = <a href="#">Learn more</a>;

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
              {FIREWALL_LABEL_TEXT}
            </Typography>
            <Typography>
              {FIREWALL_HELPER_TEXT}
              {deviceSelectGuidance ? ` ${deviceSelectGuidance}` : null}
            </Typography>
            <Typography
              sx={(theme) => ({
                margin: `${theme.spacing(2)} ${theme.spacing(0)}`,
              })}
            >
              {NODEBALANCER_HELPER_TEXT}
              <br />
              {learnMoreLink}
            </Typography>
          </Box>
          <Autocomplete
            onChange={(_, linodes) => {
              setFieldValue(
                'devices.linodes',
                linodes.map((linode) => linode.id)
              );
            }}
            sx={(theme) => ({
              marginTop: theme.spacing(2),
            })}
            disabled={userCannotAddFirewall || !!linodeError}
            errorText={errors['devices.linodes']}
            label={inCreateFlow ? 'Additional Linodes (Optional)' : 'Linodes'}
            loading={linodeIsLoading}
            multiple
            noMarginTop={false}
            noOptionsText="No Linodes available to add"
            options={linodes || []}
            value={selectedLinodes}
          />
          <Autocomplete
            label={
              inCreateFlow
                ? 'Additional NodeBalancers (Optional)'
                : 'NodeBalancers'
            }
            onChange={(_, nodebalancers) => {
              setFieldValue(
                'devices.nodebalancers',
                nodebalancers.map((nodebalancer) => nodebalancer.id)
              );
            }}
            sx={(theme) => ({
              marginTop: theme.spacing(2),
            })}
            disabled={userCannotAddFirewall || !!nodebalancerError}
            errorText={errors['devices.nodebalancers']}
            loading={nodebalancerIsLoading}
            multiple
            noMarginTop={false}
            noOptionsText="No NodeBalancers available to add"
            options={nodebalancers || []}
            value={selectedNodeBalancers}
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
