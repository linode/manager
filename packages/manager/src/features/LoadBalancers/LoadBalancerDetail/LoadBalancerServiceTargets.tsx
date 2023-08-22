import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { InputAdornment } from 'src/components/InputAdornment';
import { Link } from 'src/components/Link';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLoadBalancerServiceTargetsQuery } from 'src/queries/aglb/serviceTargets';

const PREFERENCE_KEY = 'loadbalancer-service-targets';

export const LoadBalancerServiceTargets = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const [label, setLabel] = useState<string>();

  const pagination = usePagination(1, PREFERENCE_KEY);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${PREFERENCE_KEY}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  if (label) {
    filter['label'] = label;
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
        alignItems="flex-end"
        direction="row"
        flexWrap="wrap"
        gap={2}
        mb={2}
        mt={1.5}
      >
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear"
                  onClick={() => setLabel('')}
                  size="small"
                  sx={{ padding: 'unset' }}
                >
                  <CloseIcon
                    color="inherit"
                    sx={{ color: '#aaa !important' }}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
          hideLabel
          label="Filter"
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Filter"
          style={{ minWidth: '320px' }}
          value={label}
        />
        <Box flexGrow={1} />
        <Button buttonType="primary">Create Service Target</Button>
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
            <TableCell>Endpoints</TableCell>
            <TableCell>Algorithm</TableCell>
            <TableCell>Health Checks</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error && <TableRowError colSpan={3} message={error?.[0].reason} />}
          {data?.results === 0 && <TableRowEmpty colSpan={3} />}
          {data?.data.map((serviceTarget) => (
            <TableRow key={serviceTarget.label}>
              <TableCell>
                <Link to={String(serviceTarget.id)}>{serviceTarget.label}</Link>
              </TableCell>
              <TableCell>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <StatusIcon status="active" />
                  <Typography>4 up</Typography>
                  <Typography>&mdash;</Typography>
                  <StatusIcon status="error" />
                  <Typography>6 down</Typography>
                </Stack>
              </TableCell>
              <TableCell sx={{ textTransform: 'capitalize' }}>
                {serviceTarget.load_balancing_policy.replace('_', ' ')}
              </TableCell>
              <TableCell>
                {serviceTarget.healthcheck.interval !== 0 ? 'Yes' : 'No'}
              </TableCell>
              <TableCell actionCell>
                <ActionMenu
                  actionsList={[
                    { onClick: () => null, title: 'Edit' },
                    { onClick: () => null, title: 'Delete' },
                  ]}
                  ariaLabel={`Action Menu for service target ${label}`}
                />
              </TableCell>
            </TableRow>
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
    </>
  );
};
