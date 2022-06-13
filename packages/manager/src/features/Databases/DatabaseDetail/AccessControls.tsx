import { Database } from '@linode/api-v4/lib/databases';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import Typography from 'src/components/core/Typography';
import InlineMenuAction from 'src/components/InlineMenuAction';
import Notice from 'src/components/Notice';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { useDatabaseMutation } from 'src/queries/databases';
import { ExtendedIP, stringToExtendedIP } from 'src/utilities/ipUtils';
import AddAccessControlDrawer from './AddAccessControlDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  topSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  sectionTitleAndText: {
    width: '100%',
  },
  sectionTitle: {
    marginBottom: '0.25rem',
  },
  sectionText: {
    marginBottom: '1rem',
    width: '65%',
    marginRight: 0,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  addAccessControlBtn: {
    minWidth: 214,
    [theme.breakpoints.down('sm')]: {
      alignSelf: 'flex-start',
      marginBottom: '1rem',
    },
  },
  table: {
    width: '50%',
    border: `solid 1px ${theme.borderColors.borderTable}`,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  row: {
    '&:last-of-type td': {
      borderBottom: 'none',
    },
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `solid 1px ${theme.borderColors.borderTable}`,
  },
  removeButton: {
    float: 'right',
  },
  restrictWarning: {
    width: '50%',
  },
  restrictWarningText: {
    fontSize: '0.875rem,',
  },
}));

interface Props {
  database: Database;
  description?: JSX.Element;
}

export const AccessControls: React.FC<Props> = (props) => {
  const {
    database: { id, engine, allow_list: allowList },
    description,
  } = props;

  const classes = useStyles();

  const [isDialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();

  const [
    accessControlToBeRemoved,
    setAccessControlToBeRemoved,
  ] = React.useState<string | null>(null);

  const [
    addAccessControlDrawerOpen,
    setAddAccessControlDrawerOpen,
  ] = React.useState<boolean>(false);

  const [extendedIPs, setExtendedIPs] = React.useState<ExtendedIP[]>([]);

  const {
    mutateAsync: updateDatabase,
    isLoading: databaseUpdating,
  } = useDatabaseMutation(engine, id);

  React.useEffect(() => {
    if (allowList.length > 0) {
      const allowListExtended = allowList.map(stringToExtendedIP);

      setExtendedIPs(allowListExtended);
    } else {
      setExtendedIPs([]);
    }
  }, [allowList]);

  const handleClickRemove = (accessControl: string) => {
    setError(undefined);
    setDialogOpen(true);
    setAccessControlToBeRemoved(accessControl);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleRemoveIPAddress = () => {
    updateDatabase({
      allow_list: allowList.filter(
        (ipAddress) => ipAddress !== accessControlToBeRemoved
      ),
    })
      .then(() => {
        handleDialogClose();
      })
      .catch((e: APIError[]) => {
        setError(e[0].reason);
      });
  };

  const ipTable = (accessControlsList: string[]) => {
    if (accessControlsList.length === 0) {
      return null;
    }

    return (
      <Table className={classes.table} data-qa-access-controls>
        <TableBody>
          {accessControlsList.map((accessControl) => (
            <TableRow key={`${accessControl}-row`} className={classes.row}>
              <TableCell
                key={`${accessControl}-tablecell`}
                className={classes.cell}
              >
                {accessControl}
                <InlineMenuAction
                  actionText="Remove"
                  className={classes.removeButton}
                  onClick={() => handleClickRemove(accessControl)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const actionsPanel = (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={handleDialogClose}>
        Cancel
      </Button>

      <Button
        buttonType="primary"
        onClick={handleRemoveIPAddress}
        loading={databaseUpdating}
      >
        Remove IP Address
      </Button>
    </ActionsPanel>
  );

  return (
    <>
      <div className={classes.topSection}>
        <div className={classes.sectionTitleAndText}>
          <div className={classes.sectionTitle}>
            <Typography variant="h3">Access Controls</Typography>
          </div>
          <div className={classes.sectionText}>{description ?? null}</div>
        </div>
        <AddNewLink
          label="Manage Access Controls"
          onClick={() => setAddAccessControlDrawerOpen(true)}
          className={classes.addAccessControlBtn}
        />
      </div>
      {ipTable(allowList)}
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        title={`Remove IP Address ${accessControlToBeRemoved}`}
        actions={actionsPanel}
      >
        {error ? <Notice error text={error} /> : null}
        <Typography data-testid="ip-removal-confirmation-warning">
          IP {accessControlToBeRemoved} will lose all access to the data on this
          database cluster. This action cannot be undone, but you can re-enable
          access by clicking Manage Access Controls and adding the same IP
          address.
        </Typography>
      </ConfirmationDialog>
      <AddAccessControlDrawer
        open={addAccessControlDrawerOpen}
        onClose={() => setAddAccessControlDrawerOpen(false)}
        updateDatabase={updateDatabase}
        allowList={extendedIPs}
      />
    </>
  );
};

export default AccessControls;
