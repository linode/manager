import { useLinodeFirewallsQuery } from '@linode/queries';
import { Button, Drawer, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

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

import { AddFirewallForm } from './AddFirewallForm';
import { LinodeFirewallsRow } from './LinodeFirewallsRow';

import type { Firewall, FirewallDevice } from '@linode/api-v4';

interface LinodeFirewallsProps {
  linodeID: number;
}

export const LinodeFirewalls = (props: LinodeFirewallsProps) => {
  const { linodeID } = props;

  const {
    data: attachedFirewallData,
    error,
    isLoading,
  } = useLinodeFirewallsQuery(linodeID);

  const attachedFirewalls = attachedFirewallData?.data;

  const [selectedFirewall, setSelectedFirewall] = React.useState<Firewall>();
  const [deviceToBeRemoved, setDeviceToBeRemoved] =
    React.useState<FirewallDevice>();
  const [isRemoveDeviceDialogOpen, setIsRemoveDeviceDialogOpen] =
    React.useState<boolean>(false);
  const [isAddFirewallDrawerOpen, setIsAddFirewalDrawerOpen] =
    React.useState<boolean>(false);

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
      <LinodeFirewallsRow
        firewall={attachedFirewall}
        key={`firewall-${attachedFirewall.id}`}
        linodeID={linodeID}
        onClickUnassign={handleClickUnassign}
      />
    ));
  };

  return (
    <Stack>
      <Paper
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          pl: 2,
          pr: 0.5,
          py: 0.5,
        }}
      >
        <Typography data-testid="linode-firewalls-table-header" variant="h3">
          Firewalls
        </Typography>
        <Button
          buttonType="primary"
          disabled={attachedFirewallData && attachedFirewallData.results >= 1}
          onClick={() => setIsAddFirewalDrawerOpen(true)}
          tooltipText="Linodes can only have one Firewall assigned."
        >
          Add Firewall
        </Button>
      </Paper>
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
        NotFoundComponent={NotFound}
        onClose={() => setIsAddFirewalDrawerOpen(false)}
        open={isAddFirewallDrawerOpen}
        title="Add Firewall"
      >
        <AddFirewallForm
          entityId={linodeID}
          entityType="linode"
          onCancel={() => setIsAddFirewalDrawerOpen(false)}
        />
      </Drawer>
    </Stack>
  );
};
