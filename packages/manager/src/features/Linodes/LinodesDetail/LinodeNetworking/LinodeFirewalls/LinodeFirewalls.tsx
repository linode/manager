import { Firewall, FirewallDevice } from '@linode/api-v4';
import { Stack } from '@mui/material';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Typography } from 'src/components/Typography';
import { RemoveDeviceDialog } from 'src/features/Firewalls/FirewallDetail/Devices/RemoveDeviceDialog';
import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';

import { LinodeFirewallsRow } from './LinodeFirewallsRow';

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
  const [
    deviceToBeRemoved,
    setDeviceToBeRemoved,
  ] = React.useState<FirewallDevice>();
  const [
    isRemoveDeviceDialogOpen,
    setIsRemoveDeviceDialogOpen,
  ] = React.useState<boolean>(false);

  const handleClickUnassign = (device: FirewallDevice, firewall: Firewall) => {
    setDeviceToBeRemoved(device);
    setSelectedFirewall(firewall);
    setIsRemoveDeviceDialogOpen(true);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return <TableRowLoading columns={5} rows={1} />;
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
    <Stack sx={{ marginTop: '20px' }}>
      <Box bgcolor={(theme) => theme.color.white} display="flex">
        <Typography
          sx={(theme) => ({
            lineHeight: '1.5rem',
            marginBottom: theme.spacing(),
            marginLeft: '15px',
            marginTop: theme.spacing(),
          })}
          data-testid="linode-firewalls-table-header"
          variant="h3"
        >
          Firewalls
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Firewall</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Rules</TableCell>
            <TableCell></TableCell>
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
    </Stack>
  );
};
