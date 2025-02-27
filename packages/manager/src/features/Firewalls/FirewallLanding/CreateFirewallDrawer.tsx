/* eslint-disable jsx-a11y/anchor-is-valid */
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@linode/ui';
import { CreateFirewallSchema } from '@linode/validation/lib/firewalls.schema';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { Link } from 'src/components/Link';
import { FIREWALL_LIMITS_CONSIDERATIONS_LINK } from 'src/constants';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { NodeBalancerSelect } from 'src/features/NodeBalancers/NodeBalancerSelect';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import {
  useAllFirewallsQuery,
  useCreateFirewall,
  useGrants,
} from '@linode/queries';
import {
  sendLinodeCreateFormInputEvent,
  sendLinodeCreateFormStepEvent,
} from 'src/utilities/analytics/formEventAnalytics';
import { getEntityIdsByPermission } from 'src/utilities/grants';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import {
  FIREWALL_HELPER_TEXT,
  FIREWALL_LABEL_TEXT,
  LINODE_CREATE_FLOW_TEXT,
  NODEBALANCER_CREATE_FLOW_TEXT,
  NODEBALANCER_HELPER_TEXT,
  READ_ONLY_DEVICES_HIDDEN_MESSAGE,
} from './constants';

import type {
  CreateFirewallPayload,
  Firewall,
  FirewallDeviceEntityType,
  Linode,
  NodeBalancer,
} from '@linode/api-v4';
import type { LinodeCreateQueryParams } from 'src/features/Linodes/types';
import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';

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
    const { mutateAsync: createFirewall } = useCreateFirewall();
    const { data } = useAllFirewallsQuery(open);

    const { enqueueSnackbar } = useSnackbar();

    const location = useLocation();
    const isFromLinodeCreate = location.pathname.includes('/linodes/create');
    const queryParams = getQueryParamsFromQueryString<LinodeCreateQueryParams>(
      location.search
    );

    const firewallFormEventOptions: LinodeCreateFormEventOptions = {
      createType: queryParams.type ?? 'OS',
      headerName: 'Create Firewall',
      interaction: 'click',
      label: '',
    };

    const {
      control,
      formState: { errors, isSubmitting },
      handleSubmit,
      reset,
      setError,
    } = useForm<CreateFirewallPayload>({
      defaultValues: initialValues,
      mode: 'onBlur',
      resolver: yupResolver<CreateFirewallPayload>(CreateFirewallSchema),
      values: initialValues,
    });

    const handleClose = () => {
      onClose();
      reset();
    };

    const createCustomFirewall = async (values: CreateFirewallPayload) => {
      try {
        const firewall = await createFirewall(values);
        enqueueSnackbar(`Firewall ${values.label} successfully created`, {
          variant: 'success',
        });

        if (onFirewallCreated) {
          onFirewallCreated(firewall);
        }
        handleClose();
        // Fire analytics form submit upon successful firewall creation from Linode Create flow.
        if (isFromLinodeCreate) {
          sendLinodeCreateFormStepEvent({
            ...firewallFormEventOptions,
            label: 'Create Firewall',
          });
        }
      } catch (errors) {
        for (const error of errors) {
          setError(error?.field ?? 'root', { message: error.reason });
        }
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
          sendLinodeCreateFormInputEvent({
            ...firewallFormEventOptions,
            label: 'Learn more',
            subheaderName: 'Assign services to the Firewall',
          })
        }
        to={FIREWALL_LIMITS_CONSIDERATIONS_LINK}
      >
        Learn more
      </Link>
    );

    return (
      <Drawer onClose={handleClose} open={open} title="Create Firewall">
        <form onSubmit={handleSubmit(createCustomFirewall)}>
          {userCannotAddFirewall ? (
            <Notice
              text="You don't have permissions to create a new Firewall. Please contact an account administrator for details."
              variant="error"
            />
          ) : null}
          {errors.root?.message && (
            <Notice spacingTop={8} variant="error">
              <ErrorMessage
                entity={{ type: 'firewall_id' }}
                message={errors.root.message}
              />
            </Notice>
          )}
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                inputProps={{
                  autoFocus: true,
                }}
                aria-label="Label for your new Firewall"
                disabled={userCannotAddFirewall}
                errorText={fieldState.error?.message}
                label="Label"
                name="label"
                onBlur={field.onBlur}
                onChange={field.onChange}
                required
                value={field.value}
              />
            )}
            control={control}
            name="label"
          />
          <Typography style={{ marginTop: 24 }}>
            <strong>Default Inbound Policy</strong>
          </Typography>
          <Controller
            render={({ field }) => (
              <RadioGroup
                aria-label="default inbound policy "
                data-testid="default-inbound-policy"
                onChange={field.onChange}
                row
                value={field.value}
              >
                <FormControlLabel
                  control={<Radio />}
                  label="Accept"
                  value="ACCEPT"
                />
                <FormControlLabel
                  control={<Radio />}
                  label="Drop"
                  value="DROP"
                />
              </RadioGroup>
            )}
            control={control}
            name="rules.inbound_policy"
          />
          <Typography style={{ marginTop: 16 }}>
            <strong>Default Outbound Policy</strong>
          </Typography>
          <Controller
            render={({ field }) => (
              <RadioGroup
                aria-label="default outbound policy "
                data-testid="default-outbound-policy"
                onChange={field.onChange}
                row
                value={field.value}
              >
                <FormControlLabel
                  control={<Radio />}
                  label="Accept"
                  value="ACCEPT"
                />
                <FormControlLabel
                  control={<Radio />}
                  label="Drop"
                  value="DROP"
                />
              </RadioGroup>
            )}
            control={control}
            name="rules.outbound_policy"
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
              {deviceSelectGuidance && ` ${deviceSelectGuidance}`}
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
          <Controller
            render={({ field, fieldState }) => (
              <LinodeSelect
                label={
                  createFlow === 'linode' ? LINODE_CREATE_FLOW_TEXT : 'Linodes'
                }
                onSelectionChange={(linodes) => {
                  field.onChange(linodes.map((linode) => linode.id));
                }}
                errorText={fieldState.error?.message}
                helperText={deviceSelectGuidance}
                multiple
                optionsFilter={linodeOptionsFilter}
                value={field.value ?? null}
              />
            )}
            control={control}
            name="devices.linodes"
          />
          <Controller
            render={({ field, fieldState }) => (
              <NodeBalancerSelect
                label={
                  createFlow === 'nodebalancer'
                    ? NODEBALANCER_CREATE_FLOW_TEXT
                    : 'NodeBalancers'
                }
                onSelectionChange={(nodebalancers) => {
                  field.onChange(
                    nodebalancers.map((nodebalancer) => nodebalancer.id)
                  );
                }}
                errorText={fieldState.error?.message}
                helperText={deviceSelectGuidance}
                multiple
                optionsFilter={nodebalancerOptionsFilter}
                value={field.value ?? null}
              />
            )}
            control={control}
            name="devices.nodebalancers"
          />
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: userCannotAddFirewall,
              label: 'Create Firewall',
              loading: isSubmitting,
              onClick: handleSubmit(createCustomFirewall),
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: handleClose,
            }}
          />
        </form>
      </Drawer>
    );
  }
);
