import { ManagedCredential } from 'linode-js-sdk/lib/managed/types';
import * as React from 'react';
import { createStyles, makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

import ActionMenu from './CredentialActionMenu';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      width: '30%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    credentialDescription: {
      paddingTop: theme.spacing(1) / 2
    },
    credentialRow: {
      '&:before': {
        display: 'none'
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
    >
      <TableCell
        parentColumn="Credential"
        className={classes.label}
        data-qa-credential-label
      >
        <Typography variant="h3">{credential.label}</Typography>
      </TableCell>
      <TableCell parentColumn="Last Decrypted" data-qa-credential-decrypted>
        {/** If credential.last_decrypted is null, it has never been decrypted */}
        {credential.last_decrypted ? (
          <DateTimeDisplay value={credential.last_decrypted} />
        ) : (
          'Never'
        )}
      </TableCell>
      <TableCell>
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
