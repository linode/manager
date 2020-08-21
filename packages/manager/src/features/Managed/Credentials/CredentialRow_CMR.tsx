import { ManagedCredential } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import { createStyles, makeStyles, Theme } from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';

import ActionMenu from './CredentialActionMenu_CMR';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    credentialDescription: {
      paddingTop: theme.spacing(1) / 2
    },
    credentialRow: {
      '&:before': {
        display: 'none'
      }
    },
    actionInner: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: 0,
      '&.MuiTableCell-root': {
        paddingRight: 0
      }
    }
  })
);

interface Props {
  credential: ManagedCredential;
  openDialog: (id: number, label: string) => void;
  openForEdit: (id: number) => void;
}

type CombinedProps = Props;

export const CredentialRow: React.FunctionComponent<CombinedProps> = props => {
  const { credential, openDialog, openForEdit } = props;
  const classes = useStyles();

  return (
    <TableRow
      key={credential.id}
      data-qa-credential-cell={credential.id}
      data-testid={'credential-row'}
      className={classes.credentialRow}
      ariaLabel={`Credential ${credential.label}`}
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
          openDialog={openDialog}
          openForEdit={openForEdit}
          label={credential.label}
        />
      </TableCell>
    </TableRow>
  );
};

export default CredentialRow;
