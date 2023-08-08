import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { RemoveDeviceDialog } from 'src/features/Firewalls/FirewallDetail/Devices/RemoveDeviceDialog';
import { ActionHandlers as FirewallHandlers } from 'src/features/Firewalls/FirewallLanding/FirewallActionMenu';
import { FirewallRow } from 'src/features/Firewalls/FirewallLanding/FirewallRow';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';

import {
  StyledDiv,
  StyledGrid,
  StyledHeadline,
} from './LinodeFirewalls.styles';

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

  const handlers = ({
    triggerRemoveDevice: () => setIsRemoveDeviceDialogOpen(true),
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
        linodeId={linodeID}
        onClose={() => setIsRemoveDeviceDialogOpen(false)}
        onLinodeNetworkTab
        open={isRemoveDeviceDialogOpen}
      />
    </>
  );
};
