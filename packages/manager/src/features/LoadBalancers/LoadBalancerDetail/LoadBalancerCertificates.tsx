import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import EnhancedSelect from 'src/components/EnhancedSelect';
import { InputAdornment } from 'src/components/InputAdornment';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
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

import type { Certificate } from '@linode/api-v4';

const PREFERENCE_KEY = 'loadbalancer-certificates';

const CERTIFICATE_TYPE_LABEL_MAP: Record<Certificate['type'], string> = {
  ca: 'Service Target Certificate',
  downstream: 'TLS Certificate',
};

type CertificateTypeFilter = 'all' | Certificate['type'];

export const LoadBalancerCertificates = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const [type, setType] = useState<CertificateTypeFilter>('all');
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

  if (type !== 'all') {
    filter['type'] = type;
  }

  if (label) {
    filter['label'] = label;
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

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'TLS Certificates', value: 'tls' },
    { label: 'Service Target Certificates', value: 'ca' },
  ];

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
        <EnhancedSelect
          styles={{
            container: () => ({
              maxWidth: '200px',
            }),
          }}
          isClearable={false}
          label="Certificate Type"
          noMarginTop
          onChange={(option) => setType(option?.value as CertificateTypeFilter)}
          options={filterOptions}
          value={filterOptions.find((option) => option.value === type) ?? null}
        />
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
