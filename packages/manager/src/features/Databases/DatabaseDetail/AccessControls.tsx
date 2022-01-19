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
import ExternalLink from 'src/components/Link';
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
  },
  sectionHeader: {
    marginBottom: '0.25rem',
  },
  sectionText: {
    marginBottom: '1rem',
    width: '65%',
    marginRight: 0,
  },
  addAccessControlBtn: {
    minWidth: 180,
  },
  table: {
    width: '50%',
    border: `solid 1px ${theme.cmrBorderColors.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `solid 1px ${theme.cmrBorderColors.divider}`,
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
}

export const AccessControls: React.FC<Props> = (props) => {
  const {
    database: { id, engine, allow_list: allowList },
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

  const { mutateAsync: updateDatabase } = useDatabaseMutation(engine, id);

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
      <Table className={classes.table}>
        <TableBody>
          {accessControlsList.map((accessControl) => (
            <TableRow key={`${accessControl}-row`}>
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

      <Button buttonType="primary" onClick={handleRemoveIPAddress}>
        Remove IP Address
      </Button>
    </ActionsPanel>
  );

  return (
    <>
      <div className={classes.topSection}>
        <div>
          <div className={classes.sectionHeader}>
            <Typography variant="h3">Access Controls</Typography>
          </div>
          <div className={classes.sectionText}>
            <Typography>
              Add the IP addresses or IP range(s) for other instances or users
              that should have the authorization to view this cluster&apos;s
              database. By default, all public and private connections are
              denied.{' '}
              <ExternalLink to="https://www.linode.com/docs/products/database">
                Learn more.
              </ExternalLink>
            </Typography>
          </div>
        </div>
        <AddNewLink
          label="Add Access Control"
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
          access by clicking Add Access Control and adding the same IP address
          or IP range.
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
