import { useAllFirewallsQuery, useGrants } from '@linode/queries';
import { LinodeSelect } from '@linode/shared';
import {
  Box,
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  Typography,
} from '@linode/ui';
import { getEntityIdsByPermission } from '@linode/utilities';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { FIREWALL_LIMITS_CONSIDERATIONS_LINK } from 'src/constants';
import { NodeBalancerSelect } from 'src/features/NodeBalancers/NodeBalancerSelect';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import {
  FIREWALL_HELPER_TEXT,
  FIREWALL_LABEL_TEXT,
  LINODE_CREATE_FLOW_TEXT,
  NODEBALANCER_CREATE_FLOW_TEXT,
  NODEBALANCER_HELPER_TEXT,
  READ_ONLY_DEVICES_HIDDEN_MESSAGE,
} from './constants';

import type { CreateFirewallFormValues } from './formUtilities';
import type {
  FirewallDeviceEntityType,
  Linode,
  NodeBalancer,
} from '@linode/api-v4';
import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';

interface CustomFirewallProps {
  createFlow: FirewallDeviceEntityType | undefined;
  firewallFormEventOptions: LinodeCreateFormEventOptions;
  isFromLinodeCreate: boolean;
  open: boolean;
  userCannotAddFirewall: boolean;
}
export const CustomFirewallFields = (props: CustomFirewallProps) => {
  const {
    createFlow,
    firewallFormEventOptions,
    isFromLinodeCreate,
    open,
    userCannotAddFirewall,
  } = props;
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const { control } = useFormContext<CreateFirewallFormValues>();
  const { data } = useAllFirewallsQuery(open);
  const { _isRestrictedUser } = useAccountManagement();
  const { data: grants } = useGrants();

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
      !assignedLinodes?.some((service) => service.id === linode.id) &&
      linode.interface_generation !== 'linode'
    );
  };

  const nodebalancerOptionsFilter = (nodebalancer: NodeBalancer) => {
    return (
      !readOnlyNodebalancerIds.includes(nodebalancer.id) &&
      !assignedNodeBalancers?.some((service) => service.id === nodebalancer.id)
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
    <>
      <Typography style={{ marginTop: 24 }}>
        <strong>Default Inbound Policy</strong>
      </Typography>
      <Controller
        control={control}
        name="rules.inbound_policy"
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
              disabled={userCannotAddFirewall}
              label="Accept"
              value="ACCEPT"
            />
            <FormControlLabel
              control={<Radio />}
              disabled={userCannotAddFirewall}
              label="Drop"
              value="DROP"
            />
          </RadioGroup>
        )}
      />
      <Typography style={{ marginTop: 16 }}>
        <strong>Default Outbound Policy</strong>
      </Typography>
      <Controller
        control={control}
        name="rules.outbound_policy"
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
              disabled={userCannotAddFirewall}
              label="Accept"
              value="ACCEPT"
            />
            <FormControlLabel
              control={<Radio />}
              disabled={userCannotAddFirewall}
              label="Drop"
              value="DROP"
            />
          </RadioGroup>
        )}
      />
      <Box>
        <Typography
          sx={(theme) => ({
            margin: `${theme.spacingFunction(16)} ${theme.spacingFunction(0)}`,
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
            margin: `${theme.spacingFunction(16)} ${theme.spacingFunction(0)}`,
          })}
        >
          {NODEBALANCER_HELPER_TEXT}
          <br />
          {learnMoreLink}.
        </Typography>
      </Box>
      {isLinodeInterfacesEnabled && (
        <Notice variant="info">
          Linodes using Linode Interfaces must be assigned after firewall
          creation.
        </Notice>
      )}
      <Controller
        control={control}
        name="devices.linodes"
        render={({ field, fieldState }) => (
          <LinodeSelect
            disabled={userCannotAddFirewall}
            errorText={fieldState.error?.message}
            helperText={deviceSelectGuidance}
            label={
              createFlow === 'linode' ? LINODE_CREATE_FLOW_TEXT : 'Linodes'
            }
            multiple
            onSelectionChange={(linodes) => {
              field.onChange(linodes.map((linode) => linode.id));
            }}
            optionsFilter={linodeOptionsFilter}
            value={field.value ?? null}
          />
        )}
      />
      <Controller
        control={control}
        name="devices.nodebalancers"
        render={({ field, fieldState }) => (
          <NodeBalancerSelect
            disabled={userCannotAddFirewall}
            errorText={fieldState.error?.message}
            helperText={deviceSelectGuidance}
            label={
              createFlow === 'nodebalancer'
                ? NODEBALANCER_CREATE_FLOW_TEXT
                : 'NodeBalancers'
            }
            multiple
            onSelectionChange={(nodebalancers) => {
              field.onChange(
                nodebalancers.map((nodebalancer) => nodebalancer.id)
              );
            }}
            optionsFilter={nodebalancerOptionsFilter}
            value={field.value ?? null}
          />
        )}
      />
    </>
  );
};
