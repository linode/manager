/* eslint-disable jsx-a11y/anchor-is-valid */
import { Firewall, FirewallDevice } from '@linode/api-v4';
import { Stack } from '@mui/material';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Typography } from 'src/components/Typography';
import { CREATE_FIREWALL_LINK } from 'src/constants';
import { RemoveDeviceDialog } from 'src/features/Firewalls/FirewallDetail/Devices/RemoveDeviceDialog';
import { useNodeBalancersFirewallsQuery } from 'src/queries/nodebalancers';

import { NodeBalancerFirewallsRow } from './NodeBalancerFirewallsRow';

interface Props {
  displayFirewallInfoText: boolean;
  nodeBalancerId: number;
}

export const NodeBalancerFirewalls = (props: Props) => {
  const { displayFirewallInfoText, nodeBalancerId } = props;

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

  const learnMoreLink = (
    <Link to={CREATE_FIREWALL_LINK}>Learn more about creating Firewalls.</Link>
  );
  const firewallLink = <Link to="/firewalls/">Firewalls</Link>;

  return (
    <Stack sx={{ marginTop: '0px' }}>
      <Box display="flex">
        {displayFirewallInfoText ? (
          <Typography
            sx={(theme) => ({
              marginBottom: theme.spacing(),
            })}
            data-testid="nodebalancer-firewalls-table-header"
          >
            If you want to assign a new Firewall to this NodeBalancer, go to{' '}
            {firewallLink}.
            <br />
            {learnMoreLink}
          </Typography>
        ) : null}
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
