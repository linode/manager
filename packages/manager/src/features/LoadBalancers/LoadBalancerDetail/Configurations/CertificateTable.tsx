import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { useLoadBalancerCertificatesQuery } from 'src/queries/aglb/certificates';

import type { Configuration } from '@linode/api-v4';

interface Props {
  certificates: Configuration['certificates'];
  loadbalancerId: number;
  onRemove: (index: number) => void;
}

export const CertificateTable = (props: Props) => {
  const { certificates, loadbalancerId, onRemove } = props;

  const { data } = useLoadBalancerCertificatesQuery(
    loadbalancerId,
    {},
    { '+or': certificates.map((cert) => ({ id: cert.id })) }
  );

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Certificate</TableCell>
          <TableCell>Host Header</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {certificates.length === 0 && <TableRowEmpty colSpan={3} />}
        {certificates.map((cert, idx) => {
          const certificate = data?.data.find((c) => c.id === cert.id);
          return (
            <TableRow key={idx}>
              <TableCell>{certificate?.label ?? cert.id}</TableCell>
              <TableCell>{cert.hostname}</TableCell>
              <TableCell actionCell>
                <IconButton onClick={() => onRemove(idx)}>
                  <CloseIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
