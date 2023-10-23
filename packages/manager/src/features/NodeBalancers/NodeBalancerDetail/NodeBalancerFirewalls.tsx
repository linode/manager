/* eslint-disable jsx-a11y/anchor-is-valid */
import { Firewall, FirewallDevice } from '@linode/api-v4';
import { Stack } from '@mui/material';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Link } from 'src/components/Link';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Typography } from 'src/components/Typography';
import { RemoveDeviceDialog } from 'src/features/Firewalls/FirewallDetail/Devices/RemoveDeviceDialog';
// import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';
import { useNodeBalancersFirewallsQuery } from 'src/queries/nodebalancers';

// import { LinodeFirewallsRow } from '../../Linodes/LinodesDetail/LinodeNetworking/LinodeFirewalls/LinodeFirewallsRow';
import { NodeBalancerFirewallsRow } from './NodeBalancerFirewallsRow';

interface Props {
  // linodeID: number;
  displayFirewallInfoText: boolean;
  nodeBalancerID: number;
}

export const NodeBalancerFirewalls = (props: Props) => {
  const { displayFirewallInfoText, nodeBalancerID } = props;

  const {
    data: attachedFirewallData,
    error,
    isLoading,
  } = useNodeBalancersFirewallsQuery(nodeBalancerID);

  // console.log('#####################', attachedFirewallData);

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
      return <ErrorState errorText={error?.[0].reason} />;
    }

    if (attachedFirewalls?.length === 0 || attachedFirewalls === undefined) {
      return <TableRowEmpty colSpan={5} message="No Firewalls are assigned." />;
    }

    return attachedFirewalls.map((attachedFirewall) => (
      <NodeBalancerFirewallsRow
        firewall={attachedFirewall}
        key={`firewall-${attachedFirewall.id}`}
        nodeBalancerID={nodeBalancerID}
        // linodeID={linodeID}
        // test
        onClickUnassign={handleClickUnassign}
      />
    ));
  };

  const learnMoreLink = <a href="#">Learn more about creating Firewalls.</a>;
  const firewallLink = <Link to="/firewalls/">Firewalls</Link>;

  return (
    <Stack sx={{ marginTop: '0px' }}>
      <Box bgcolor={(theme) => theme.color.white} display="flex">
        {displayFirewallInfoText ?
          <Typography
            sx={(theme) => ({
              marginBottom: theme.spacing(),
            })}
            data-testid="linode-firewalls-table-header"
          >
            If you want to assign a new Firewall to this NodeBalancer, go to{' '}
            {firewallLink}.
            <br />
            {learnMoreLink}
          </Typography>
          : null}
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
        linodeId={nodeBalancerID}
        onClose={() => setIsRemoveDeviceDialogOpen(false)}
        onLinodeNetworkTab
        open={isRemoveDeviceDialogOpen}
      />
    </Stack>
  );
};
