import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import type { Configuration } from '@linode/api-v4';

interface Props {
  certificates: Configuration['certificates'];
  onRemove: (index: number) => void;
}

export const CertificateTable = ({ certificates, onRemove }: Props) => {
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
        {certificates.map((cert, idx) => (
          <TableRow key={idx}>
            <TableCell>{cert.id}</TableCell>
            <TableCell>{cert.hostname}</TableCell>
            <TableCell actionCell>
              <IconButton onClick={() => onRemove(idx)}>
                <CloseIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
