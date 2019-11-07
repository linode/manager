import { LongviewClient } from 'linode-js-sdk/lib/longview';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import AddNewLink from 'src/components/AddNewLink';
import Search from 'src/components/DebouncedSearchTextField';
import Grid from 'src/components/Grid';

import withLongviewClients, {
  Props as LongviewProps
} from 'src/containers/longview.container';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import DeleteDialog from './LongviewDeleteDialog';
import LongviewTable from './LongviewTable';
import UpdateDrawer from './UpdateClientDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  headingWrapper: {
    marginTop: theme.spacing()
  },
  addNew: {
    marginLeft: 'auto'
  },
  searchbar: {
    marginBottom: theme.spacing(2),
    '& >div': {
      width: '300px'
    }
  }
}));

type CombinedProps = RouteComponentProps & LongviewProps & WithSnackbarProps;

export const LongviewClients: React.FC<CombinedProps> = props => {
  const [newClientLoading, setNewClientLoading] = React.useState<boolean>(
    false
  );
  const [filteredClientList, filterClientList] = React.useState<
    Record<string, LongviewClient> | undefined
  >();
  const [editDrawerOpen, toggleEditDrawer] = React.useState<boolean>(false);
  const [deleteDialogOpen, toggleDeleteDialog] = React.useState<boolean>(false);
  const [selectedClientID, setClientID] = React.useState<number | undefined>(
    undefined
  );
  const [selectedClientLabel, setClientLabel] = React.useState<string>('');

  const classes = useStyles();

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

  const handleSearch = (query: string) => {
    return filterClientList(
      filterLongviewClientsByQuery(query, longviewClientsData)
    );
  };

  return (
    <React.Fragment>
      <Grid container className={classes.headingWrapper}>
        <Grid item className={`pt0 ${classes.searchbar}`}>
          <Search onSearch={handleSearch} debounceTime={250} />
        </Grid>
        <Grid item className={`${classes.addNew} pt0`}>
          <AddNewLink
            onClick={handleAddClient}
            label={newClientLoading ? 'Loading...' : 'Add a Client'}
          />
        </Grid>
      </Grid>
      <LongviewTable
        longviewClientsData={
          !!filteredClientList ? filteredClientList : longviewClientsData
        }
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

export const filterLongviewClientsByQuery = (
  query: string,
  clientList: Record<string, LongviewClient>
) => {
  /** just return the original list if there's no query */
  if (!query.trim()) {
    return clientList;
  }

  /**
   * see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
   * We need to escape some characters because an error will be thrown if not:
   *
   * Invalid regular expression: Unmatched ')'
   */
  const cleanedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return Object.keys(clientList).reduce((acc, eachKey) => {
    const thisClient = clientList[eachKey];
    if (thisClient.label.match(new RegExp(`${cleanedQuery}`, 'gmi'))) {
      acc[eachKey] = thisClient;
    }

    return acc;
  }, {});
};
