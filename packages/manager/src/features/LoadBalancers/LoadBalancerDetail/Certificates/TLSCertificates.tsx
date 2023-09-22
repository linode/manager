import Stack from '@mui/material/Stack';
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu';
import { CircleProgress } from 'src/components/CircleProgress';
import { Link } from 'src/components/Link';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLoadBalancerCertificatesQuery } from 'src/queries/aglb/certificates';

import { CreateCertificateDrawer } from './CreateCertificateDrawer';
import { DeleteCertificateDialog } from './DeleteCertificateDialog';

import type { Certificate, Filter } from '@linode/api-v4';

const PREFERENCE_KEY = 'loadbalancer-certificates';

export const TLSCertificates = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();
  const history = useHistory();

  const id = Number(loadbalancerId);

  const isCreateDrawerOpen = history.location.pathname.endsWith('/create');
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  const [selectedCertificateId, setSelectedCertificateId] = useState<number>();

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
    type: 'downstream',
  };

  const { data, error, isLoading } = useLoadBalancerCertificatesQuery(
    id,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const onDeleteCertificate = (certificate: Certificate) => {
    setIsDeleteDrawerOpen(true);
    setSelectedCertificateId(certificate.id);
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  const selectedCertificate = data?.data.find(
    (cert) => cert.id === selectedCertificateId
  );

  return (
    <Stack paddingTop={1} spacing={2}>
      <Typography>
        Certificate used by your load balancer to terminate the connection and
        decrypt request from client. Apply these certificate(s) in the Details
        section of your HTTPS <Link to="">Configuration</Link>.
      </Typography>
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
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error && <TableRowError colSpan={3} message={error?.[0].reason} />}
          {data?.results === 0 && <TableRowEmpty colSpan={3} />}
          {data?.data.map((certificate) => (
            <TableRow key={`${certificate.label}-${certificate.type}`}>
              <TableCell>{certificate.label}</TableCell>
              <TableCell actionCell>
                <ActionMenu
                  actionsList={[
                    { onClick: () => null, title: 'Edit' },
                    {
                      onClick: () => onDeleteCertificate(certificate),
                      title: 'Delete',
                    },
                  ]}
                  ariaLabel={`Action Menu for certificate ${certificate.label}`}
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
      <CreateCertificateDrawer
        onClose={() =>
          history.push(`/loadbalancers/${loadbalancerId}/certificates/tls`)
        }
        loadbalancerId={id}
        open={isCreateDrawerOpen}
        type="downstream"
      />
      <DeleteCertificateDialog
        certificate={selectedCertificate}
        loadbalancerId={id}
        onClose={() => setIsDeleteDrawerOpen(false)}
        open={isDeleteDrawerOpen}
      />
    </Stack>
  );
};
