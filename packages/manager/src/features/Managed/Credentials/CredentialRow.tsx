import { ManagedCredential } from '@linode/api-v4/lib/managed';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import ActionMenu from './CredentialActionMenu';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionInner: {
      '&.MuiTableCell-root': {
        paddingRight: 0,
      },
      display: 'flex',
      justifyContent: 'flex-end',
      padding: 0,
    },
    credentialDescription: {
      paddingTop: theme.spacing(0.5),
    },
    credentialRow: {
      '&:before': {
        display: 'none',
      },
    },
  })
);

interface Props {
  credential: ManagedCredential;
  openDialog: (id: number, label: string) => void;
  openForEdit: (id: number) => void;
}

type CombinedProps = Props;

export const CredentialRow: React.FunctionComponent<CombinedProps> = (
  props
) => {
  const { credential, openDialog, openForEdit } = props;
  const classes = useStyles();

  return (
    <TableRow
      ariaLabel={`Credential ${credential.label}`}
      className={classes.credentialRow}
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
      <TableCell className={classes.actionInner}>
        <ActionMenu
          credentialID={credential.id}
          label={credential.label}
          openDialog={openDialog}
          openForEdit={openForEdit}
        />
      </TableCell>
    </TableRow>
  );
};

export default CredentialRow;
