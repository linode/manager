import { styled } from '@mui/material/styles';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { CredentialActionMenu } from './CredentialActionMenu';

import type { ManagedCredential } from '@linode/api-v4/lib/managed';

interface CredentialRowProps {
  credential: ManagedCredential;
}

export const CredentialRow = (props: CredentialRowProps) => {
  const { credential } = props;

  return (
    <StyledTableRow
      data-qa-credential-cell={credential.id}
      data-testid={'credential-row'}
      key={credential.id}
    >
      <TableCell data-qa-credential-label>{credential.label}</TableCell>
      <TableCell data-qa-credential-decrypted>
        {/** If credential.last_decrypted is null, it has never been decrypted */}
        {credential.last_decrypted ? (
          <DateTimeDisplay value={credential.last_decrypted} />
        ) : (
          'Never'
        )}
      </TableCell>
      <StyledTableCell>
        <CredentialActionMenu
          credentialId={credential.id}
          label={credential.label}
        />
      </StyledTableCell>
    </StyledTableRow>
  );
};

const StyledTableCell = styled(TableCell, { label: 'StyledTableCell' })({
  '&.MuiTableCell-root': {
    paddingRight: 0,
  },
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 0,
});

const StyledTableRow = styled(TableRow, { label: 'StyledTableRow' })({
  '&:before': {
    display: 'none',
  },
});

export default CredentialRow;
