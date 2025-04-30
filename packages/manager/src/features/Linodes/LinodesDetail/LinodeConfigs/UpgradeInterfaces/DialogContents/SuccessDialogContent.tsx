import { Box, Button, Notice, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { SUCCESS_DRY_RUN_COPY, SUCCESS_UPGRADE_COPY } from '../constants';
import { initialState } from '../UpgradeInterfacesDialog';
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
  const { isDryRun, linodeInterfaces, selectedConfig } = state;

  const location = useLocation();
  const history = useHistory();

  const { isPending, upgradeToLinodeInterfaces } = useUpgradeToLinodeInterfaces(
    {
      linodeId,
      selectedConfig,
      setDialogState,
    }
  );

  return (
    <Stack gap={2}>
      <Notice variant="success">
        <Typography>
          {isDryRun ? SUCCESS_DRY_RUN_COPY : SUCCESS_UPGRADE_COPY}
        </Typography>
      </Notice>
      {linodeInterfaces.length > 0 && (
        <Box
          sx={(theme) => ({
            backgroundColor: theme.tokens.alias.Background.Neutral,
            padding: theme.spacingFunction(16),
          })}
        >
          <Typography variant="h3">
            {isDryRun ? 'Dry Run Summary' : 'Upgrade Summary'}
          </Typography>
          {linodeInterfaces.map((linodeInterface) => (
            <LinodeInterfaceInfo
              isDryRun={isDryRun}
              key={linodeInterface.id}
              {...linodeInterface}
            />
          ))}
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button buttonType="secondary" disabled={isPending} onClick={onClose}>
          {isDryRun ? 'Cancel' : 'Close'}
        </Button>
        {isDryRun && (
          <>
            <Button
              buttonType="outlined"
              disabled={isPending}
              onClick={() => setDialogState({ ...initialState })}
            >
              Return to Overview
            </Button>
            <Button
              buttonType="primary"
              loading={isPending}
              onClick={() => upgradeToLinodeInterfaces(false)}
            >
              Continue to Upgrade
            </Button>
          </>
        )}
        {!isDryRun && (
          <Button
            buttonType="primary"
            onClick={() => {
              const newPath = location.pathname
                .split('/')
                // remove 'upgrade-interfaces' from URL
                .slice(0, -1)
                // join everything back together
                .join('/')
                .concat('/networking');
              history.replace(newPath);
            }}
          >
            View Network Settings
          </Button>
        )}
      </Box>
    </Stack>
  );
};

interface UpgradeLinodeInterfaceInfo extends LinodeInterface {
  isDryRun: boolean;
}

const LinodeInterfaceInfo = (props: UpgradeLinodeInterfaceInfo) => {
  const {
    created,
    id,
    isDryRun,
    mac_address,
    public: publicInterface,
    updated,
    version,
    vlan,
    vpc,
  } = props;

  return (
    <Stack gap={2} marginTop={2}>
      <Stack>
        <Typography
          sx={(theme) => ({
            marginBottom: theme.spacingFunction(16),
          })}
        >
          <strong>
            Interface Meta Info{!isDryRun ? `: Interface #${id}` : ''}
          </strong>
        </Typography>
        {!isDryRun && <Typography>ID: {id}</Typography>}
        <Typography>MAC Address: {mac_address}</Typography>
        <Typography>Created: {created}</Typography>
        <Typography>Updated: {updated}</Typography>
        <Typography>Version: {version}</Typography>
      </Stack>
      {publicInterface && (
        <Typography>
          {isDryRun
            ? 'Public Interface dry run successful.'
            : 'Public Interface successfully upgraded.'}
        </Typography>
      )}
      {vpc && <VPCInterfaceInfo {...vpc} default_route={props.default_route} />}
      {vlan && <VlanInterfaceInfo vlan={vlan} />}
    </Stack>
  );
};

type VPCInterfaceInfo = VPCInterfaceData &
  Pick<LinodeInterface, 'default_route'>;

const VPCInterfaceInfo = (props: VPCInterfaceInfo) => {
  const { default_route, ipv4, subnet_id, vpc_id } = props;
  const { addresses, ranges } = ipv4 || {};

  const primaryAddress = addresses?.find((address) => address.primary === true);

  return (
    <>
      <Typography>
        <strong>VPC Interface Details</strong>
      </Typography>
      <Stack>
        {default_route && (
          <Typography>
            Default Route:{' '}
            {default_route.ipv4 ? 'IPv4' : default_route.ipv6 ? 'IPv6' : 'None'}
          </Typography>
        )}
        <Typography>VPC ID: {vpc_id}</Typography>
        <Typography>Subnet ID: {subnet_id}</Typography>
        <Typography>
          Addresses: {addresses?.map((address) => address.address).join(', ')}
        </Typography>
        {primaryAddress && (
          <Typography>Primary Address: {primaryAddress.address}</Typography>
        )}
        {ranges && ranges?.length > 0 && (
          <Typography>Routed Ranges: {ranges?.join(', ')}</Typography>
        )}
      </Stack>
    </>
  );
};

const VlanInterfaceInfo = (props: Pick<LinodeInterface, 'vlan'>) => {
  const { vlan } = props;

  const { ipam_address, vlan_label } = vlan!;

  return (
    <>
      <Typography>
        <strong>VLAN Interface Details</strong>
      </Typography>
      <Stack>
        <Typography>Label: {vlan_label}</Typography>
        <Typography>IPAM Address: {ipam_address}</Typography>
      </Stack>
    </>
  );
};
