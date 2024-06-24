/* eslint-disable jsx-a11y/anchor-is-valid */
import { CreateFirewallSchema } from '@linode/validation/lib/firewalls.schema';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { FIREWALL_LIMITS_CONSIDERATIONS_LINK } from 'src/constants';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { NodeBalancerSelect } from 'src/features/NodeBalancers/NodeBalancerSelect';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useAllFirewallsQuery, useCreateFirewall } from 'src/queries/firewalls';
import { useGrants } from 'src/queries/profile/profile';
import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { getEntityIdsByPermission } from 'src/utilities/grants';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import {
  LINODE_CREATE_FLOW_TEXT,
  NODEBALANCER_CREATE_FLOW_TEXT,
} from './constants';

import type {
  CreateFirewallPayload,
  Firewall,
  FirewallDeviceEntityType,
  Linode,
  NodeBalancer,
} from '@linode/api-v4';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

export const READ_ONLY_DEVICES_HIDDEN_MESSAGE =
  'Only services you have permission to modify are shown.';
const NODEBALANCER_HELPER_TEXT = `Only the firewall's inbound rules apply to NodeBalancers.`;

export interface CreateFirewallDrawerProps {
  createFlow: FirewallDeviceEntityType | undefined;
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
    inbound_policy: 'DROP',
    outbound_policy: 'ACCEPT',
  },
};

export const CreateFirewallDrawer = React.memo(
  (props: CreateFirewallDrawerProps) => {
    // TODO: NBFW - We'll eventually want to check the read_write firewall grant here too, but it doesn't exist yet.
    const { createFlow, onClose, onFirewallCreated, open } = props;
    const { _hasGrant, _isRestrictedUser } = useAccountManagement();
    const { data: grants } = useGrants();
    const { mutateAsync } = useCreateFirewall();
    const { data } = useAllFirewallsQuery(open);

    const { enqueueSnackbar } = useSnackbar();

    const location = useLocation();
    const isFromLinodeCreate = location.pathname.includes('/linodes/create');
    const queryParams = getQueryParamsFromQueryString(location.search);

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

    const FirewallLabelText = `Assign services to the Firewall`;
    const FirewallHelperText = `Assign one or more services to this firewall. You can add services later if you want to customize your rules first.`;

    React.useEffect(() => {
      if (open) {
        resetForm();
      }
    }, [open, resetForm]);

    const handleInboundPolicyChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>, value: 'ACCEPT' | 'DROP') => {
        setFieldValue('rules.inbound_policy', value);
      },
      [setFieldValue]
    );

    const handleOutboundPolicyChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>, value: 'ACCEPT' | 'DROP') => {
        setFieldValue('rules.outbound_policy', value);
      },
      [setFieldValue]
    );

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

    const assignedServices = data?.map((firewall) => firewall.entities).flat();

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

    const learnMoreLink = (
      <Link
        onClick={() =>
          isFromLinodeCreate &&
          sendLinodeCreateFormStepEvent({
            action: 'click',
            category: 'link',
            createType:
              (queryParams.type as LinodeCreateType) ?? 'Distributions',
            formStepName: 'Create Firewall Drawer',
            label: 'Learn more',
            version: 'v1',
          })
        }
        to={FIREWALL_LIMITS_CONSIDERATIONS_LINK}
      >
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

          <Typography style={{ marginTop: 24 }}>
            <strong>Default Inbound Policy</strong>
          </Typography>
          <RadioGroup
            aria-label="default inbound policy "
            data-testid="default-inbound-policy"
            onChange={handleInboundPolicyChange}
            row
            value={values.rules.inbound_policy}
          >
            <FormControlLabel
              control={<Radio />}
              label="Accept"
              value="ACCEPT"
            />
            <FormControlLabel control={<Radio />} label="Drop" value="DROP" />
          </RadioGroup>

          <Typography style={{ marginTop: 16 }}>
            <strong>Default Outbound Policy</strong>
          </Typography>
          <RadioGroup
            aria-label="default outbound policy"
            data-testid="default-outbound-policy"
            onChange={handleOutboundPolicyChange}
            row
            value={values.rules.outbound_policy}
          >
            <FormControlLabel
              control={<Radio />}
              label="Accept"
              value="ACCEPT"
            />
            <FormControlLabel control={<Radio />} label="Drop" value="DROP" />
          </RadioGroup>

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
            <Typography
              sx={(theme) => ({
                margin: `${theme.spacing(2)} ${theme.spacing(0)}`,
              })}
            >
              {NODEBALANCER_HELPER_TEXT}
              <br />
              {learnMoreLink}.
            </Typography>
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
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: userCannotAddFirewall,
              label: 'Create Firewall',
              loading: isSubmitting,
              onClick: () =>
                isFromLinodeCreate &&
                sendLinodeCreateFormStepEvent({
                  action: 'click',
                  category: 'button',
                  createType:
                    (queryParams.type as LinodeCreateType) ?? 'Distributions',
                  formStepName: 'Create Firewall Drawer',
                  label: 'Create Firewall',
                  version: 'v1',
                }),
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
