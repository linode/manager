import { useNodeBalancersFirewallsQuery } from '@linode/queries';
import { Box, Button, Stack, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { Link } from 'src/components/Link';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { NodeBalancerFirewallsRow } from './NodeBalancerFirewallsRow';

import type { Firewall } from '@linode/api-v4';

interface Props {
  nodeBalancerId: number;
}

export const NodeBalancerFirewalls = (props: Props) => {
  const { nodeBalancerId } = props;
  const navigate = useNavigate();

  const {
    data: attachedFirewallData,
    error,
    isLoading,
  } = useNodeBalancersFirewallsQuery(nodeBalancerId);

  const attachedFirewalls = attachedFirewallData?.data;

  const handleClickUnassign = (firewall: Firewall) => {
    navigate({
      params: {
        firewallId: firewall.id,
        id: nodeBalancerId,
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
              params: { id: nodeBalancerId },
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
    </Stack>
  );
};
