import { Stack } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Typography } from 'src/components/Typography';
import { RemoveDeviceDialog } from 'src/features/Firewalls/FirewallDetail/Devices/RemoveDeviceDialog';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';

import { LinodeFirewallsRow } from './LinodeFirewallsRow';

interface LinodeFirewallsProps {
  linodeID: number;
}

export const LinodeFirewalls = (props: LinodeFirewallsProps) => {
  const { linodeID } = props;

  const theme = useTheme<Theme>();

  const {
    data: attachedFirewallData,
    error,
    isLoading,
  } = useLinodeFirewallsQuery(linodeID);

  const attachedFirewall = attachedFirewallData?.data[0];

  const { data: devices } = useAllFirewallDevicesQuery(
    attachedFirewall?.id ?? -1
  );

  const [
    isRemoveDeviceDialogOpen,
    setIsRemoveDeviceDialogOpen,
  ] = React.useState<boolean>(false);

  const firewallDevice = devices?.find(
    (device) => device.entity.type === 'linode' && device.entity.id === linodeID
  );

  const renderTableContent = () => {
    if (isLoading) {
      return <TableRowLoading columns={5} rows={1} />;
    }

    if (error) {
      return <ErrorState errorText={error?.[0].reason} />;
    }

    if (!attachedFirewall) {
      return <TableRowEmpty colSpan={5} message="No Firewalls are assigned." />;
    }

    return (
      <LinodeFirewallsRow
        firewall={attachedFirewall}
        triggerRemoveDevice={() => setIsRemoveDeviceDialogOpen(true)}
      />
    );
  };

  return (
    <Stack sx={{ marginTop: '20px' }}>
      <Box bgcolor={theme.color.white} display="flex">
        <Typography
          sx={{
            lineHeight: '1.5rem',
            marginBottom: theme.spacing(),
            marginLeft: '15px',
            marginTop: theme.spacing(),
          }}
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
        device={firewallDevice}
        firewallId={attachedFirewall?.id ?? -1}
        firewallLabel={attachedFirewall?.label ?? ''}
        linodeId={linodeID}
        onClose={() => setIsRemoveDeviceDialogOpen(false)}
        onLinodeNetworkTab
        open={isRemoveDeviceDialogOpen}
      />
    </Stack>
  );
};
