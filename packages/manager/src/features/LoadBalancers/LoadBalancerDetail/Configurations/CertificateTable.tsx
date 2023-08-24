import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import type { Configuration } from '@linode/api-v4';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

interface Props {
  certificate_table: Configuration['certificate_table'];
  onRemove: (index: number) => void;
}

export const CertificateTable = ({ certificate_table, onRemove }: Props) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Label</TableCell>
          <TableCell>Host Header</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {certificate_table.length === 0 && <TableRowEmpty colSpan={3} />}
        {certificate_table.map((cert, idx) => (
          <TableRow key={`${cert.certificate_id}-${cert.sni_hostname}`}>
            <TableCell>{cert.certificate_id}</TableCell>
            <TableCell>{cert.sni_hostname}</TableCell>
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
