import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { Button } from 'akamai-cds-react-components';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useDatabaseMutation } from 'src/queries/databases/databases';

import AddAccessControlDrawer from './AddAccessControlDrawer';

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
    borderBottom: `solid 1px ${theme.borderColors.borderTable}`,
    display: 'flex',
    justifyContent: 'space-between',
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

  const [addAccessControlDrawerOpen, setAddAccessControlDrawerOpen] =
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
            <TableRow className={classes.row} key={`${accessControl}-row`}>
              <TableCell
                className={classes.cell}
                key={`${accessControl}-tablecell`}
              >
                {accessControl}
                <InlineMenuAction
                  actionText="Remove"
                  className={classes.removeButton}
                  disabled={disabled}
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
    <ActionsPanel
      primaryButtonProps={{
        label: 'Remove IP Address',
        loading: databaseUpdating,
        onClick: handleRemoveIPAddress,
      }}
      secondaryButtonProps={{ label: 'Cancel', onClick: handleDialogClose }}
    />
  );

  return (
    <>
      <div className={classes.topSection}>
        <div className={classes.sectionTitleAndText}>
          <div className={classes.sectionTitle}>
            <Typography variant="h3">Manage Access</Typography>
          </div>
          <div className={classes.sectionText}>{description ?? null}</div>
        </div>
        <Button
          className={classes.addAccessControlBtn}
          data-testid="button-access-control"
          disabled={disabled}
          onClick={() => setAddAccessControlDrawerOpen(true)}
          variant="secondary"
        >
          Manage Access
        </Button>
      </div>
      {ipTable(database.allow_list)}
      <ConfirmationDialog
        actions={actionsPanel}
        onClose={handleDialogClose}
        open={isDialogOpen}
        title={`Remove IP Address ${accessControlToBeRemoved}`}
      >
        {error ? <Notice text={error} variant="error" /> : null}
        <Typography data-testid="ip-removal-confirmation-warning">
          IP {accessControlToBeRemoved} will lose all access to the data on this
          database cluster. This action cannot be undone, but you can re-enable
          access by clicking Manage Access Controls and adding the same IP
          address.
        </Typography>
      </ConfirmationDialog>
      <AddAccessControlDrawer
        database={database}
        onClose={() => setAddAccessControlDrawerOpen(false)}
        open={addAccessControlDrawerOpen}
      />
    </>
  );
};

export default AccessControls;
