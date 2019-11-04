import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import AddNewLink from 'src/components/AddNewLink';
import Grid from 'src/components/Grid';

import withLongviewClients, {
  Props as LongviewProps
} from 'src/containers/longview.container';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import DeleteDialog from './LongviewDeleteDialog';
import LongviewTable from './LongviewTable';
import UpdateDrawer from './UpdateClientDrawer';

type CombinedProps = RouteComponentProps & LongviewProps & WithSnackbarProps;

export const LongviewClients: React.FC<CombinedProps> = props => {
  const [newClientLoading, setNewClientLoading] = React.useState<boolean>(
    false
  );
  const [editDrawerOpen, toggleEditDrawer] = React.useState<boolean>(false);
  const [deleteDialogOpen, toggleDeleteDialog] = React.useState<boolean>(false);
  const [selectedClientID, setClientID] = React.useState<number | undefined>(
    undefined
  );
  const [selectedClientLabel, setClientLabel] = React.useState<string>('');

  React.useEffect(() => {
    props.getLongviewClients();
  }, []);

  const openDeleteDialog = (id: number, label: string) => {
    toggleDeleteDialog(true);
    setClientID(id);
    setClientLabel(label);
  };

  const openEditDrawer = (id: number, label: string) => {
    toggleEditDrawer(true);
    setClientID(id);
    setClientLabel(label);
  };

  const handleAddClient = () => {
    setNewClientLoading(true);
    createLongviewClient()
      .then(_ => {
        setNewClientLoading(false);
      })
      .catch(errorResponse => {
        props.enqueueSnackbar(
          getAPIErrorOrDefault(
            errorResponse,
            'Error creating Longview client.'
          )[0].reason,
          { variant: 'error' }
        ),
          setNewClientLoading(false);
      });
  };

  const {
    longviewClientsData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    createLongviewClient,
    deleteLongviewClient,
    updateLongviewClient
  } = props;

  return (
    <React.Fragment>
      <Grid
        container
        justify="flex-end"
        alignItems="flex-end"
        style={{ paddingBottom: 0 }}
      >
        <Grid item>
          <Grid container alignItems="flex-end">
            <Grid item className="pt0">
              {/** @todo replace with actual loading state when design is ready */}
              <AddNewLink
                onClick={handleAddClient}
                label={newClientLoading ? 'Loading...' : 'Add a Client'}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <LongviewTable
        longviewClientsData={longviewClientsData}
        longviewClientsError={longviewClientsError}
        longviewClientsLastUpdated={longviewClientsLastUpdated}
        longviewClientsLoading={longviewClientsLoading}
        longviewClientsResults={longviewClientsResults}
        triggerDeleteLongviewClient={openDeleteDialog}
        triggerEditLongviewClient={openEditDrawer}
      />
      <UpdateDrawer
        title={`Rename Longview Client${
          selectedClientLabel ? `: ${selectedClientLabel}` : ''
        }`}
        selectedID={selectedClientID}
        selectedLabel={selectedClientLabel}
        updateClient={updateLongviewClient}
        open={editDrawerOpen}
        onClose={() => toggleEditDrawer(false)}
      />
      <DeleteDialog
        selectedLongviewClientID={selectedClientID}
        selectedLongviewClientLabel={selectedClientLabel}
        deleteClient={deleteLongviewClient}
        open={deleteDialogOpen}
        closeDialog={() => toggleDeleteDialog(false)}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, RouteComponentProps>(
  React.memo,
  withLongviewClients(),
  withSnackbar
)(LongviewClients);
