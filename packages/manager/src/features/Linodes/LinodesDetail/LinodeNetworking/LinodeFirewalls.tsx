import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

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
import { FirewallRow } from 'src/features/Firewalls/FirewallLanding/FirewallRow';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { useLinodeFirewalls } from 'src/queries/linodes/firewalls';
import { ActionHandlers as FirewallHandlers } from 'src/features/Firewalls/FirewallLanding/FirewallActionMenu';

interface LinodeFirewallsProps {
  linodeID: number;
}

export const LinodeFirewalls = (props: LinodeFirewallsProps) => {
  const { linodeID } = props;

  const { data: attachedFirewallData, error, isLoading } = useLinodeFirewalls(
    linodeID
  );
  const attachedFirewall = attachedFirewallData?.data[0];

  const { data: devices } = useAllFirewallDevicesQuery(
    attachedFirewall?.id ?? -1
  );

  const [
    isRemoveDeviceDialogOpen,
    setIsRemoveDeviceDialogOpen,
  ] = React.useState<boolean>(false);

  const handleOpenRemoveDeviceDialog = (firewallDeviceID: number) => {
    // setSelectedFirewallDeviceID(firewallDeviceID);
    setIsRemoveDeviceDialogOpen(true);
  };

  const firewallDevice = devices?.find(
    (device) => device.entity.type === 'linode' && device.entity.id === linodeID
  );

  const handlers = ({
    triggerRemoveDevice: handleOpenRemoveDeviceDialog,
    // triggerDeleteFirewall: () => null,
    // triggerDisableFirewall: () => null,
    // triggerEnableFirewall: () => null,
  } as unknown) as FirewallHandlers;

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
      <FirewallRow
        key={attachedFirewall.id}
        onLinodeNetworkTab
        {...attachedFirewall}
        {...handlers}
      />
    );
  };

  return (
    <>
      <StyledDiv>
        <StyledGrid
          alignItems="flex-end"
          container
          justifyContent="space-between"
          spacing={1}
        >
          <Grid className="p0">
            <StyledHeadline variant="h3">Firewalls</StyledHeadline>
          </Grid>
        </StyledGrid>
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
      </StyledDiv>
      <RemoveDeviceDialog
        device={firewallDevice}
        firewallId={attachedFirewall?.id ?? -1}
        firewallLabel={attachedFirewall?.label ?? ''}
        onClose={() => setIsRemoveDeviceDialogOpen(false)}
        onLinodeNetworkTab
        open={isRemoveDeviceDialogOpen}
      />
    </>
  );
};

const StyledDiv = styled('div')(() => ({
  marginTop: '20px',
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.color.white,
  margin: 0,
  width: '100%',
}));

const StyledHeadline = styled(Typography)(() => ({
  lineHeight: '1.5rem',
  marginBottom: 8,
  marginLeft: 15,
  marginTop: 8,
}));
