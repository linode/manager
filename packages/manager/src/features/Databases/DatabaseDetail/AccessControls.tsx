import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@akamai/cds-components/react/Table';
import { Spacing } from '@akamai/cds-tokens';
import { useDatabaseMutation } from '@linode/queries';
import * as React from 'react';
import type { JSX } from 'react';
import { makeStyles } from 'tss-react/mui';

import globalStyles from '../shared/global.module.css';
import { ManageAccessControlDrawer } from './ManageAccessControlDrawer';

import type { APIError, Database } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  addAccessControlBtn: {
    minWidth: 225,
    [theme.breakpoints.down('md')]: {
      alignSelf: 'flex-start',
      marginBottom: '1rem',
    },
  },
  cell: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: 0,
  },
  restrictWarning: {
    width: '50%',
  },
  restrictWarningText: {
    fontSize: '0.875rem,',
  },
  row: {
    '&:last-of-type td': {
      borderBottom: 'none',
    },
  },
  sectionText: {
    marginBottom: '1rem',
    marginRight: 0,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    width: '65%',
  },
  sectionTitle: {
    marginBottom: '0.25rem',
  },
  sectionTitleAndText: {
    width: '100%',
  },
  table: {
    border: `solid 1px ${theme.borderColors.borderTable}`,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    width: '50%',
  },
  topSection: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
}));

interface Props {
  database: Database;
  description?: JSX.Element;
  disabled?: boolean;
}

export const AccessControls = (props: Props) => {
  const { database, description, disabled } = props;

  const { classes } = useStyles();

  const [isDialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();

  const [accessControlToBeRemoved, setAccessControlToBeRemoved] =
    React.useState<null | string>(null);

  const [manageAccessControlDrawerOpen, setManageAccessControlDrawerOpen] =
    React.useState<boolean>(false);

  const { isPending: databaseUpdating, mutateAsync: updateDatabase } =
    useDatabaseMutation(database.engine, database.id);

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
      allow_list: database.allow_list.filter(
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
            <TableRow
              className={classes.row}
              hoverable
              key={`${accessControl}-row`}
              zebra
            >
              <TableCell
                className={classes.cell}
                key={`${accessControl}-tablecell`}
              >
                {accessControl}
              </TableCell>
              <TableCell
                className={globalStyles.actionsCell}
                key={`${accessControl}-tablecell-button`}
              >
                {disabled ? (
                  <Button disabled={disabled} size="large" variant="primary">
                    Remove
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleClickRemove(accessControl)}
                    size="large"
                    variant="link"
                  >
                    Remove
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <div className={classes.topSection}>
        <div className={classes.sectionTitleAndText}>
          <div className={classes.sectionTitle}>
            <h3 style={{ margin: 0 }}>Manage Access</h3>
          </div>
          <div className={classes.sectionText}>{description ?? null}</div>
        </div>
        <Button
          className={classes.addAccessControlBtn}
          data-testid="button-access-control"
          disabled={disabled}
          onClick={() => setManageAccessControlDrawerOpen(true)}
          variant="secondary"
        >
          Manage Access
        </Button>
      </div>
      {ipTable(database.allow_list)}
      <Modal closeModal={handleDialogClose} open={isDialogOpen}>
        <span slot="title">Remove IP Address {accessControlToBeRemoved}</span>
        <div slot="body">
          {error ? (
            <NotificationBanner
              style={{ marginBottom: Spacing.S16 }}
              text={error}
              type="error"
            />
          ) : null}
          <p
            data-testid="ip-removal-confirmation-warning"
            style={{ margin: 0 }}
          >
            IP {accessControlToBeRemoved} will lose all access to the data on
            this database cluster. This action cannot be undone, but you can
            re-enable access by clicking Manage Access Controls and adding the
            same IP address.
          </p>
        </div>
        <div slot="actions">
          <Button onClick={handleDialogClose} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleRemoveIPAddress}
            processing={databaseUpdating}
            variant="primary"
          >
            Remove IP Address
          </Button>
        </div>
      </Modal>
      <ManageAccessControlDrawer
        database={database}
        onClose={() => setManageAccessControlDrawerOpen(false)}
        open={manageAccessControlDrawerOpen}
      />
    </>
  );
};

export default AccessControls;
