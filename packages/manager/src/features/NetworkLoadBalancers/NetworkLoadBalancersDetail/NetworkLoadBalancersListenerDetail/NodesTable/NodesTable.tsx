import { useNetworkLoadBalancerNodesQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import {
  CircleProgress,
  Hidden,
  Stack,
  Typography,
  useTheme,
} from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import {
  NLB_NODES_ROUTE,
  NLB_NODES_TABLE_DEFAULT_ORDER,
  NLB_NODES_TABLE_DEFAULT_ORDER_BY,
  NLB_NODES_TABLE_PREFERENCE_KEY,
} from '../../../constants';
import { NodesTableRow } from './NodesTableRow';

interface NodesTableProps {
  listenerId: number;
  nlbId: number;
}

const preferenceKey = NLB_NODES_TABLE_PREFERENCE_KEY;

export const NodesTable = (props: NodesTableProps) => {
  const navigate = useNavigate();
  const { nlbId, listenerId } = props;
  const theme = useTheme();

  const search = useSearch({
    from: NLB_NODES_ROUTE,
    shouldThrow: false,
  });

  const pagination = usePaginationV2({
    currentRoute: NLB_NODES_ROUTE,
    preferenceKey,
    searchParams: (prev) => ({
      ...prev,
      query: search?.query,
    }),
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: NLB_NODES_TABLE_DEFAULT_ORDER,
        orderBy: NLB_NODES_TABLE_DEFAULT_ORDER_BY,
      },
      from: NLB_NODES_ROUTE,
    },
    preferenceKey,
  });

  const { filter: searchFilter, error: searchError } = getAPIFilterFromQuery(
    search?.query,
    {
      searchableFieldsWithoutOperator: ['id', 'linode_id', 'address_v6'],
    }
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...searchFilter,
  };

  const {
    data: nodesData,
    error,
    isFetching,
    isLoading,
  } = useNetworkLoadBalancerNodesQuery(
    nlbId,
    listenerId,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const onSearch = (query: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: query ? query : undefined,
      }),
      to: `/netloadbalancers/${nlbId}/listeners/${listenerId}/nodes`,
    });
  };

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
          Nodes ({nodesData?.results ?? 0})
        </Typography>
        <DebouncedSearchTextField
          clearable
          debounceTime={250}
          errorText={searchError?.message}
          hideLabel
          isSearching={isFetching}
          label="Search"
          onSearch={onSearch}
          placeholder="Search Node ID, Linode ID or IP address"
          sx={{
            [theme.breakpoints.up('sm')]: {
              width: '350px',
            },
            width: '250px',
          }}
          value={search?.query ?? ''}
        />
      </Stack>
      <Table aria-label="Network Load Balancer Listener Nodes">
        <TableHead>
          <TableRow>
            <TableCell>Node Label</TableCell>
            <TableSortCell
              active={orderBy === 'id'}
              direction={order}
              handleClick={handleOrderChange}
              label="id"
            >
              ID
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'linode_id'}
              direction={order}
              handleClick={handleOrderChange}
              label="linode_id"
            >
              Linode ID
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'address_v6'}
              direction={order}
              handleClick={handleOrderChange}
              label="address_v6"
            >
              VPC IPv6
            </TableSortCell>
            <Hidden mdDown>
              <TableCell>Updated</TableCell>
              <TableCell>Created</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {error && <TableRowError colSpan={6} message={error[0].reason} />}
          {nodesData?.data?.length === 0 && (
            <TableRowEmpty
              colSpan={6}
              message="No nodes are assigned to this listener"
            />
          )}
          {nodesData?.data?.map((node) => (
            <NodesTableRow key={node.id} {...node} />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={nodesData?.results || 0}
        eventCategory="Nodes Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </Stack>
  );
};
