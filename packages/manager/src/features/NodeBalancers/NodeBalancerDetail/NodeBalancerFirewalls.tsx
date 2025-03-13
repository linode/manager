import { useNodeBalancersFirewallsQuery } from '@linode/queries';
import { Box, Button, Stack, Typography } from '@linode/ui';
import React from 'react';

import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
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

import { NodeBalancerFirewallsRow } from './NodeBalancerFirewallsRow';

import type { Firewall, FirewallDevice } from '@linode/api-v4';

interface Props {
  nodeBalancerId: number;
}

export const NodeBalancerFirewalls = (props: Props) => {
  const { nodeBalancerId } = props;

  const {
    data: attachedFirewallData,
    error,
    isLoading,
  } = useNodeBalancersFirewallsQuery(nodeBalancerId);

  const attachedFirewalls = attachedFirewallData?.data;

  const [selectedFirewall, setSelectedFirewall] = React.useState<Firewall>();

  const [
    deviceToBeRemoved,
    setDeviceToBeRemoved,
  ] = React.useState<FirewallDevice>();

  const [
    isRemoveDeviceDialogOpen,
    setIsRemoveDeviceDialogOpen,
  ] = React.useState<boolean>(false);

  const [
    isAddFirewallDrawerOpen,
    setIsAddFirewalDrawerOpen,
  ] = React.useState<boolean>(false);

  const handleClickUnassign = (device: FirewallDevice, firewall: Firewall) => {
    setDeviceToBeRemoved(device);
    setSelectedFirewall(firewall);
    setIsRemoveDeviceDialogOpen(true);
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
        firewall={attachedFirewall}
        key={`firewall-${attachedFirewall.id}`}
        nodeBalancerID={nodeBalancerId}
        onClickUnassign={handleClickUnassign}
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
          onClick={() => setIsAddFirewalDrawerOpen(true)}
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
        device={deviceToBeRemoved}
        firewallId={selectedFirewall?.id ?? -1}
        firewallLabel={selectedFirewall?.label ?? ''}
        onClose={() => setIsRemoveDeviceDialogOpen(false)}
        onService
        open={isRemoveDeviceDialogOpen}
      />
      <Drawer
        onClose={() => setIsAddFirewalDrawerOpen(false)}
        open={isAddFirewallDrawerOpen}
        title="Add Firewall"
      >
        <AddFirewallForm
          entityId={nodeBalancerId}
          entityType="nodebalancer"
          onCancel={() => setIsAddFirewalDrawerOpen(false)}
        />
      </Drawer>
    </Stack>
  );
};
