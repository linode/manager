import {
  useAllFirewallDevicesQuery,
  useFirewallQuery,
  useNodeBalancersFirewallsQuery,
} from '@linode/queries';
import { Box, Button, Drawer, Stack, Typography } from '@linode/ui';
import { useMatch, useNavigate } from '@tanstack/react-router';
import React from 'react';

import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { RemoveDeviceDialog } from 'src/features/Firewalls/FirewallDetail/Devices/RemoveDeviceDialog';
import { AddFirewallForm } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeFirewalls/AddFirewallForm';
import { useDialogData } from 'src/hooks/useDialogData';

import { NodeBalancerFirewallsRow } from './NodeBalancerFirewallsRow';

import type { Firewall } from '@linode/api-v4';

interface Props {
  nodeBalancerId: number;
}

export const NodeBalancerFirewalls = (props: Props) => {
  const { nodeBalancerId } = props;
  const navigate = useNavigate();
  const match = useMatch({
    strict: false,
  });
  const {
    data: attachedFirewallData,
    error,
    isLoading,
  } = useNodeBalancersFirewallsQuery(nodeBalancerId);

  const attachedFirewalls = attachedFirewallData?.data;

  const isUnassignFirewallRoute =
    match.routeId ===
    '/nodebalancers/$id/settings/unassign-firewall/$firewallId';

  const { data: selectedFirewall, isFetching: isFetchingSelectedFirewall } =
    useDialogData({
      enabled: isUnassignFirewallRoute,
      paramKey: 'firewallId',
      queryHook: useFirewallQuery,
      redirectToOnNotFound: '/nodebalancers/$id/settings',
    });

  const { data: devices, isFetching: isFetchingDevices } = useDialogData({
    enabled: isUnassignFirewallRoute,
    paramKey: 'firewallId',
    queryHook: useAllFirewallDevicesQuery,
    redirectToOnNotFound: '/nodebalancers/$id/settings',
  });

  const handleClickUnassign = (firewall: Firewall) => {
    navigate({
      params: {
        firewallId: String(firewall.id),
        id: String(nodeBalancerId),
      },
      to: '/nodebalancers/$id/settings/unassign-firewall/$firewallId',
    });
  };

  const renderTableContent = () => {
    if (isLoading) {
      return <TableRowLoading columns={4} rows={1} />;
    }

    if (error) {
      return <TableRowError colSpan={5} message={error?.[0]?.reason} />;
    }

    if (attachedFirewalls?.length === 0 || attachedFirewalls === undefined) {
      return <TableRowEmpty colSpan={5} message="No Firewalls are assigned." />;
    }

    return attachedFirewalls.map((attachedFirewall) => (
      <NodeBalancerFirewallsRow
        devices={devices}
        firewall={attachedFirewall}
        key={`firewall-${attachedFirewall.id}`}
        nodeBalancerId={nodeBalancerId}
        onClickUnassign={() => handleClickUnassign(attachedFirewall)}
      />
    ));
  };

  return (
    <Stack spacing={1}>
      <Box
        alignItems="center"
        display="flex"
        flexWrap={{ sm: 'unset', xs: 'wrap' }}
        gap={1}
        justifyContent="space-between"
      >
        <Typography>
          Use a <Link to="/firewalls">Firewall</Link> to control network traffic
          to your NodeBalancer. Only inbound rules are applied to NodeBalancers.
        </Typography>
        <Button
          buttonType="primary"
          disabled={attachedFirewallData && attachedFirewallData.results >= 1}
          onClick={() =>
            navigate({
              params: { id: String(nodeBalancerId) },
              to: '/nodebalancers/$id/settings/add-firewall',
            })
          }
          tooltipText="NodeBalanacers can only have one Firewall assigned."
        >
          Add Firewall
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Firewall</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Rules</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
      <RemoveDeviceDialog
        device={devices?.find(
          (device) =>
            device.entity.type === 'nodebalancer' &&
            device.entity.id === nodeBalancerId
        )}
        firewallId={selectedFirewall?.id ?? -1}
        firewallLabel={selectedFirewall?.label ?? ''}
        isFetching={isFetchingDevices || isFetchingSelectedFirewall}
        onClose={() =>
          navigate({
            params: { id: String(nodeBalancerId) },
            to: '/nodebalancers/$id/settings',
          })
        }
        onService
        open={
          match.routeId ===
          '/nodebalancers/$id/settings/unassign-firewall/$firewallId'
        }
      />
      <Drawer
        NotFoundComponent={NotFound}
        onClose={() =>
          navigate({
            params: { id: String(nodeBalancerId) },
            to: '/nodebalancers/$id/settings',
          })
        }
        open={match.routeId === '/nodebalancers/$id/settings/add-firewall'}
        title="Add Firewall"
      >
        <AddFirewallForm
          entityId={nodeBalancerId}
          entityType="nodebalancer"
          onCancel={() =>
            navigate({
              params: { id: String(nodeBalancerId) },
              to: '/nodebalancers/$id/settings',
            })
          }
        />
      </Drawer>
    </Stack>
  );
};
