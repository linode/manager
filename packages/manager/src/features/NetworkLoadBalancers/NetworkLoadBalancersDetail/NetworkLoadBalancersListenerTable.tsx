import { useNetworkLoadBalancerListenersQuery } from '@linode/queries';
import { CircleProgress, Stack, Typography, useTheme } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

interface ListenersTableProps {
  nlbId: number;
}

export const NetworkLoadBalancersListenerTable = (
  props: ListenersTableProps
) => {
  const { nlbId } = props;
  const theme = useTheme();

  const pagination = usePaginationV2({
    currentRoute: '/netloadbalancers/$id/listeners',
    preferenceKey: 'netloadbalancers-listeners',
  });

  const {
    data: nlbListeners,
    error,
    isLoading,
  } = useNetworkLoadBalancerListenersQuery(nlbId, {
    page: pagination.page,
    page_size: pagination.pageSize,
  });

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Stack>
      <Stack
        direction="row"
        gap={theme.spacingFunction(20)}
        paddingBottom={theme.spacingFunction(20)}
        paddingTop={theme.spacingFunction(40)}
        sx={(theme) => ({
          [theme.breakpoints.up('lg')]: {
            paddingLeft: 0,
          },
        })}
      >
        <Typography
          sx={{
            alignItems: 'center',
            display: 'inline-flex',
          }}
          variant="h3"
        >
          Listeners ({nlbListeners?.results ?? 0})
        </Typography>
      </Stack>
      <Table data-testid="nlb-listeners-table">
        <TableHead>
          <TableRow>
            <TableCell>Listener Label</TableCell>
            <TableCell>Port</TableCell>
            <TableCell>Protocol</TableCell>
            <TableCell>ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error && <TableRowError colSpan={4} message={error[0].reason} />}
          {nlbListeners?.data.length === 0 && (
            <TableRowEmpty
              colSpan={4}
              message="No Listeners are defined for this Network Load Balancer"
            />
          )}
          {nlbListeners?.data.map(({ id, label, port, protocol }) => (
            <TableRow data-testid={`nlb-listener-row-${id}`} key={id}>
              <TableCell>
                <Link
                  accessibleAriaLabel={label}
                  to={`/netloadbalancers/${nlbId}/listeners/${id}`}
                >
                  {label}
                </Link>
              </TableCell>
              <TableCell>{port}</TableCell>
              <TableCell>{protocol.toUpperCase()}</TableCell>
              <TableCell>{id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={nlbListeners?.results || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </Stack>
  );
};
