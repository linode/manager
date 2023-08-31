import CloseIcon from '@mui/icons-material/Close';
import { IconButton, MenuItem } from '@mui/material';
import Stack from '@mui/material/Stack';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { InputAdornment } from 'src/components/InputAdornment';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Select } from 'src/components/Select';
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
import { useLoadBalancerCertificatesQuery } from 'src/queries/aglb/certificates';

import type { Certificate, Filter } from '@linode/api-v4';

const PREFERENCE_KEY = 'loadbalancer-certificates';

const CERTIFICATE_TYPE_LABEL_MAP: Record<Certificate['type'], string> = {
  ca: 'Service Target Certificate',
  downstream: 'TLS Certificate',
};

type CertificateTypeFilter = 'all' | Certificate['type'];

export const LoadBalancerCertificates = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const [type, setType] = useState<CertificateTypeFilter>('all');
  const [query, setQuery] = useState<string>();

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

  // If the user selects a Certificate type filter, API filter by that type.
  if (type !== 'all') {
    filter['type'] = type;
  }

  // If the user types in a search query, API filter by the label.
  if (query) {
    filter['label'] = { '+contains': query };
  }

  const { data, error, isLoading } = useLoadBalancerCertificatesQuery(
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
        <Select
          label="Certificate Type"
          onChange={(e) => setType(e.target.value as CertificateTypeFilter)}
          sx={{ minWidth: 250 }}
          value={type}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="downstream">TLS Certificates</MenuItem>
          <MenuItem value="ca">Service Target Certificates</MenuItem>
        </Select>
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear"
                  onClick={() => setQuery('')}
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter"
          style={{ minWidth: '320px' }}
          value={query}
        />
        <Box flexGrow={1} />
        <Button buttonType="primary">Upload Certificate</Button>
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
              active={orderBy === 'type'}
              direction={order}
              handleClick={handleOrderChange}
              label="type"
            >
              Type
            </TableSortCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error && <TableRowError colSpan={3} message={error?.[0].reason} />}
          {data?.results === 0 && <TableRowEmpty colSpan={3} />}
          {data?.data.map(({ label, type }) => (
            <TableRow key={`${label}-${type}`}>
              <TableCell>{label}</TableCell>
              <TableCell>{CERTIFICATE_TYPE_LABEL_MAP[type]}</TableCell>
              <TableCell actionCell>
                <ActionMenu
                  actionsList={[
                    { onClick: () => null, title: 'Edit' },
                    { onClick: () => null, title: 'Delete' },
                  ]}
                  ariaLabel={`Action Menu for certificate ${label}`}
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
