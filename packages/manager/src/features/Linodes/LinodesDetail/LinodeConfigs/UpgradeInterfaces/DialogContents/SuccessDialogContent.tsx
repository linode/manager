import { Box, Button, Notice, Stack, Typography } from '@linode/ui';
import React from 'react';

import { SUCCESS_DRY_RUN_COPY, SUCCESS_UPGRADE_COPY } from '../constants';
import { useUpgradeToLinodeInterfaces } from '../useUpgradeToLinodeInterfaces';

import type {
  SuccessDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';
import type { LinodeInterface, VPCInterfaceData } from '@linode/api-v4';

export const SuccessDialogContent = (
  props: UpgradeInterfacesDialogContentProps<SuccessDialogState>
) => {
  const { linodeId, onClose, setDialogState, state } = props;

  const { upgradeToLinodeInterfaces } = useUpgradeToLinodeInterfaces({
    linodeId,
    selectedConfig: state.selectedConfig,
    setDialogState,
  });

  const { isDryRun, linodeInterfaces } = state;

  return (
    <Stack gap={2}>
      <Notice important variant="success">
        <Typography>
          {isDryRun ? SUCCESS_DRY_RUN_COPY : SUCCESS_UPGRADE_COPY}
        </Typography>
      </Notice>
      {!isDryRun && linodeInterfaces.length > 0 && (
        <Box
          sx={(theme) => ({
            backgroundColor: theme.tokens.background.Neutral,
            marginTop: theme.spacing(1),
            padding: theme.spacing(2),
          })}
        >
          <Typography
            sx={(theme) => ({
              marginTop: theme.spacing(1),
            })}
            variant="h3"
          >
            Upgrade Summary
          </Typography>
          {linodeInterfaces.map((linodeInterface) => (
            <LinodeInterfaceInfo
              key={linodeInterface.id}
              {...linodeInterface}
            />
          ))}
        </Box>
      )}
      <Stack direction="row-reverse" gap={2}>
        {isDryRun && (
          <Button
            buttonType="primary"
            onClick={() => upgradeToLinodeInterfaces(false)}
          >
            Upgrade Interfaces
          </Button>
        )}
        <Button buttonType="secondary" onClick={onClose}>
          {isDryRun ? 'Cancel' : 'Close'}
        </Button>
      </Stack>
    </Stack>
  );
};

const LinodeInterfaceInfo = (props: LinodeInterface) => {
  const {
    created,
    id,
    mac_address,
    public: publicInterface,
    updated,
    version,
    vlan,
    vpc,
  } = props;

  return (
    <>
      <Typography
        sx={(theme) => ({
          marginBottom: theme.spacing(2),
          marginTop: theme.spacing(2),
        })}
      >
        <strong>Interface Meta Info: Interface #{id}</strong>
      </Typography>
      <Typography>ID: {id}</Typography>
      <Typography>MAC Address: {mac_address}</Typography>
      <Typography>Created: {created}</Typography>
      <Typography>Updated: {updated}</Typography>
      <Typography>Version: {version}</Typography>
      {publicInterface && (
        <Typography
          sx={(theme) => ({
            marginBottom: theme.spacing(2),
            marginTop: theme.spacing(2),
          })}
        >
          Public Interface successfully upgraded
        </Typography>
      )}
      {vpc && <VPCInterfaceInfo {...vpc} default_route={props.default_route} />}
      {vlan && <VlanInterfaceInfo vlan={vlan} />}
    </>
  );
};

type VPCInterfaceInfo = VPCInterfaceData &
  Pick<LinodeInterface, 'default_route'>;

const VPCInterfaceInfo = (props: VPCInterfaceInfo) => {
  const { default_route, ipv4, subnet_id, vpc_id } = props;
  const { addresses, ranges } = ipv4;

  const primaryAddress = addresses.find((address) => address.primary === true);

  return (
    <>
      <Typography
        sx={(theme) => ({
          marginBottom: theme.spacing(2),
          marginTop: theme.spacing(2),
        })}
      >
        <strong>VPC Interface Details</strong>
      </Typography>
      {default_route && (
        <Typography>
          Default Route:{' '}
          {default_route.ipv4 ? 'IPv4' : default_route.ipv6 ? 'IPv6' : 'None'}
        </Typography>
      )}
      <Typography>VPC ID: {vpc_id}</Typography>
      <Typography>Subnet ID: {subnet_id}</Typography>
      <Typography>
        Addresses: {addresses.map((address) => address.address).join(', ')}
      </Typography>
      {primaryAddress && (
        <Typography>Primary Address: {primaryAddress.address}</Typography>
      )}
      {ranges.length > 0 && (
        <Typography>Routed Ranges: {ranges.join(', ')}</Typography>
      )}
    </>
  );
};

const VlanInterfaceInfo = (props: Pick<LinodeInterface, 'vlan'>) => {
  const { vlan } = props;

  const { ipam_address, vlan_label } = vlan!;

  return (
    <>
      <Typography
        sx={(theme) => ({
          marginBottom: theme.spacing(2),
          marginTop: theme.spacing(2),
        })}
      >
        <strong>VLAN Interface Details</strong>
      </Typography>
      <Typography>Label: {vlan_label}</Typography>
      <Typography>IPAM Address: {ipam_address}</Typography>
    </>
  );
};
