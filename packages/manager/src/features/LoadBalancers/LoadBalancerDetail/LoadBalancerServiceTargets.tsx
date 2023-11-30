import { ServiceTarget } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import { Hidden, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { InputAdornment } from 'src/components/InputAdornment';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { TextField } from 'src/components/TextField';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLoadBalancerServiceTargetsQuery } from 'src/queries/aglb/serviceTargets';

import { DeleteServiceTargetDialog } from './ServiceTargets/DeleteServiceTargetDialog';
import { ServiceTargetDrawer } from './ServiceTargets/ServiceTargetDrawer';
import { ServiceTargetRow } from './ServiceTargets/ServiceTargetRow';

import type { Filter } from '@linode/api-v4';

const PREFERENCE_KEY = 'loadbalancer-service-targets';

export const LoadBalancerServiceTargets = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const [query, setQuery] = useState<string>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [
    selectedServiceTarget,
    setSelectedServiceTarget,
  ] = useState<ServiceTarget>();

  const pagination = usePagination(1, PREFERENCE_KEY);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${PREFERENCE_KEY}-order`
  );

  const filter: Filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const handleEditServiceTarget = (serviceTarget: ServiceTarget) => {
    setIsDrawerOpen(true);
    setSelectedServiceTarget(serviceTarget);
  };

  const handleDeleteServiceTarget = (serviceTarget: ServiceTarget) => {
    setIsDeleteDialogOpen(true);
    setSelectedServiceTarget(serviceTarget);
  };

  // Once the drawer is closed, clear the selected service target for the correct add/edit drawer data.
  useEffect(() => {
    if (!isDrawerOpen) {
      setSelectedServiceTarget(undefined);
    }
  }, [isDrawerOpen]);

  // If the user types in a search query, filter results by label.
  if (query) {
    filter['label'] = { '+contains': query };
  }

  const { data, error, isLoading } = useLoadBalancerServiceTargetsQuery(
    Number(loadbalancerId),
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={2}
        justifyContent="space-between"
        mb={2}
        mt={1.5}
      >
        <TextField
          InputProps={{
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear"
                  onClick={() => setQuery('')}
                  size="small"
                  sx={{ padding: 'unset' }}
                >
                  <CloseIcon sx={{ color: '#aaa !important' }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          hideLabel
          label="Filter"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter"
          style={{ minWidth: '320px' }}
          value={query}
        />
        <Button buttonType="primary" onClick={() => setIsDrawerOpen(true)}>
          Create Service Target
        </Button>
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'protocol'}
              direction={order}
              handleClick={handleOrderChange}
              label="protocol"
            >
              Protocol
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'load_balancing_policy'}
                direction={order}
                handleClick={handleOrderChange}
                label="load_balancing_policy"
              >
                Algorithm
              </TableSortCell>
            </Hidden>
            <Hidden mdDown>
              <TableCell>Certificate</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableCell>Health Checks</TableCell>
            </Hidden>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'id'}
                direction={order}
                handleClick={handleOrderChange}
                label="id"
              >
                ID
              </TableSortCell>
            </Hidden>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error && <TableRowError colSpan={8} message={error?.[0]?.reason} />}
          {data?.results === 0 && <TableRowEmpty colSpan={8} />}
          {data?.data.map((serviceTarget) => (
            <ServiceTargetRow
              key={serviceTarget.id}
              loadbalancerId={Number(loadbalancerId)}
              onDelete={() => handleDeleteServiceTarget(serviceTarget)}
              onEdit={() => handleEditServiceTarget(serviceTarget)}
              serviceTarget={serviceTarget}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <ServiceTargetDrawer
        loadbalancerId={Number(loadbalancerId)}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        serviceTarget={selectedServiceTarget}
      />
      <DeleteServiceTargetDialog
        loadbalancerId={Number(loadbalancerId)}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        serviceTarget={selectedServiceTarget}
      />
    </>
  );
};
