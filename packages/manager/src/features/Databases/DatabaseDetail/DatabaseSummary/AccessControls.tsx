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
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { useDatabaseMutation } from 'src/queries/databases';
import AddAccessControlDrawer from '../AddAccessControlDrawer';

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
  },
  table: {
    width: '50%',
  },
  cell: {
    border: `solid 1px ${theme.cmrBorderColors.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeButton: {
    float: 'right',
    paddingRight: 15,
  },
}));

interface Props {
  databaseData: Database;
}

export const AccessControls: React.FC<Props> = (props) => {
  const {
    databaseData: { id, engine, allow_list },
  } = props;

  const classes = useStyles();

  const [isDialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [
    accessControlToBeRemoved,
    setAccessControlToBeRemoved,
  ] = React.useState<string | null>(null);

  const [
    addAccessControlDrawerOpen,
    setAddAccessControlDrawerOpen,
  ] = React.useState<boolean>(false);

  const { mutateAsync: updateDatabase } = useDatabaseMutation(engine, id);

  // Functions for "Add Access Control" button interactions.
  const handleAddAccessControlClick = () => {
    setAddAccessControlDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setAddAccessControlDrawerOpen(false);
  };

  // const handleAddAccessControlSuccess = () => {
  //   setAddAccessControlDrawerOpen(false);
  //   // RQ refresh?
  // };

  // Functions for Access Control table "Remove" button interactions.
  const handleDialogClose = () => {
    setDialogOpen(false);
    setError(undefined);
    setAccessControlToBeRemoved(null);
    // setError(undefined);
  };

  const handleError = (e: APIError[]) => {
    setError(e[0].reason);
    setLoading(false);
  };

  const handleRemove = (accessControl: string) => {
    setLoading(true);
    setError(undefined);
    updateDatabase({
      allow_list: allow_list.filter((ipAddress) => ipAddress !== accessControl),
    })
      .then(() => {
        handleDialogClose();
      })
      .catch(handleError);
  };

  const handleClickRemove = (accessControl: string) => {
    setDialogOpen(true);
    setAccessControlToBeRemoved(accessControl);
  };

  const action = {
    title: 'Remove',
    className: classes.removeButton,
    onClick: (accessControl: string) => handleClickRemove(accessControl),
  };

  const ipTable = (accessControlsList: string[]) => {
    if (accessControlsList.length === 0) {
      return (
        <TableRowEmptyState
          colSpan={12}
          message={"You don't have any Access Controls set."}
        />
      );
    }

    return (
      <Table className={classes.table}>
        <TableBody>
          {accessControlsList.map((accessControl, idx) => (
            <TableRow key={idx}>
              <TableCell key={idx} className={classes.cell}>
                {accessControl}
                <InlineMenuAction
                  actionText={action.title}
                  className={action.className}
                  onClick={() => action.onClick(accessControl)}
                />
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
        <div>
          <div className={classes.sectionHeader}>
            <Typography variant="h3">Access Controls</Typography>
          </div>
          <div className={classes.sectionText}>
            <Typography>Descriptive text...</Typography>
          </div>
        </div>
        <AddNewLink
          label="Add Access Control"
          onClick={handleAddAccessControlClick}
        />
      </div>
      {ipTable(allow_list)}
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => handleDialogClose()}
        title={`Remove IP Address ${accessControlToBeRemoved}`}
        actions={() => (
          <ActionsPanel>
            <Button buttonType="secondary" onClick={handleDialogClose}>
              Cancel
            </Button>

            <Button
              buttonType="primary"
              onClick={() => handleRemove(accessControlToBeRemoved)}
            >
              Remove
            </Button>
          </ActionsPanel>
        )}
      >
        {error ? <Notice error text={error} /> : null}
        <Typography variant="subtitle1">
          Are you sure you want to remove this IP address from the list of
          access controls?
        </Typography>
      </ConfirmationDialog>
      <AddAccessControlDrawer
        open={addAccessControlDrawerOpen}
        onClose={handleDrawerClose}
        updateDatabase={updateDatabase}
        allowList={allow_list}
        // onSuccess={handleAddAccessControlSuccess}
      />
    </>
  );
};

export default AccessControls;
