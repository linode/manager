import {
  LongviewClient,
  LongviewSubscription
} from 'linode-js-sdk/lib/longview/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import AddNewLink from 'src/components/AddNewLink';
import Search from 'src/components/DebouncedSearchTextField';
import Grid from 'src/components/Grid';

import withSettings, {
  SettingsProps
} from 'src/containers/accountSettings.container';
import withLongviewClients, {
  Props as LongviewProps
} from 'src/containers/longview.container';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import DeleteDialog from './LongviewDeleteDialog';
import LongviewList from './LongviewList';
import SubscriptionDialog from './SubscriptionDialog';

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

interface Props {
  subscriptionsData: LongviewSubscription[];
}

type CombinedProps = Props &
  RouteComponentProps &
  LongviewProps &
  WithSnackbarProps &
  SettingsProps;

export const LongviewClients: React.FC<CombinedProps> = props => {
  const [newClientLoading, setNewClientLoading] = React.useState<boolean>(
    false
  );
  const [filteredClientList, filterClientList] = React.useState<
    Record<string, LongviewClient> | undefined
  >();
  const [deleteDialogOpen, toggleDeleteDialog] = React.useState<boolean>(false);
  const [selectedClientID, setClientID] = React.useState<number | undefined>(
    undefined
  );
  const [selectedClientLabel, setClientLabel] = React.useState<string>('');

  /**
   * Subscription warning modal (shown when a user has used all of their plan's
   * available LV clients)
   */

  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = React.useState<
    boolean
  >(false);

  const classes = useStyles();

  React.useEffect(() => {
    props.getLongviewClients();
  }, []);

  const openDeleteDialog = React.useCallback(
    (id: number, label: string) => {
      toggleDeleteDialog(true);
      setClientID(id);
      setClientLabel(label);
    },
    [selectedClientID, selectedClientLabel]
  );

  const handleSubmit = () => {
    const {
      history: { push }
    } = props;

    if (isManaged) {
      push({
        pathname: '/support/tickets',
        state: {
          open: true,
          title: 'Request for additional Longview clients'
        }
      });
      return;
    }
    props.history.push('/longview/plan-details');
  };

  const handleAddClient = () => {
    setNewClientLoading(true);
    createLongviewClient()
      .then(_ => {
        setNewClientLoading(false);
      })
      .catch(errorResponse => {
        if (errorResponse[0].reason.match(/subscription/)) {
          // The user has reached their subscription limit.
          setSubscriptionDialogOpen(true);
          setNewClientLoading(false);
        } else {
          // Any network or other errors handled with a toast
          props.enqueueSnackbar(
            getAPIErrorOrDefault(
              errorResponse,
              'Error creating Longview client.'
            )[0].reason,
            { variant: 'error' }
          ),
            setNewClientLoading(false);
        }
      });
  };

  const {
    longviewClientsData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    accountSettings,
    createLongviewClient,
    deleteLongviewClient
  } = props;

  const handleSearch = (query: string) => {
    return filterClientList(
      filterLongviewClientsByQuery(query, longviewClientsData)
    );
  };

  /**
   * Pending review we can't actually use this. See
   * JIRA XXXX for details; Managed customers can get
   * an incorrect value here after enrolling or cancelling
   * Managed.
   */
  // const activeSubscription = subscriptionsData.find(
  //   thisSubscription =>
  //     thisSubscription.id ===
  //     pathOr('', ['longview_subscription'], accountSettings)
  // );

  const isManaged = pathOr(false, ['managed'], accountSettings);

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
      <LongviewList
        longviewClientsData={
          !!filteredClientList ? filteredClientList : longviewClientsData
        }
        longviewClientsError={longviewClientsError}
        longviewClientsLastUpdated={longviewClientsLastUpdated}
        longviewClientsLoading={longviewClientsLoading}
        longviewClientsResults={longviewClientsResults}
        triggerDeleteLongviewClient={openDeleteDialog}
        createLongviewClient={handleAddClient}
        loading={newClientLoading}
      />
      <DeleteDialog
        selectedLongviewClientID={selectedClientID}
        selectedLongviewClientLabel={selectedClientLabel}
        deleteClient={deleteLongviewClient}
        open={deleteDialogOpen}
        closeDialog={() => toggleDeleteDialog(false)}
      />
      <SubscriptionDialog
        isOpen={subscriptionDialogOpen}
        isManaged={isManaged}
        onClose={() => setSubscriptionDialogOpen(false)}
        onSubmit={handleSubmit}
        // @todo remove this hack and replace with activeSubscription.clients_included
        clientLimit={Object.values(longviewClientsData).length}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props & RouteComponentProps>(
  React.memo,
  withLongviewClients(),
  withSettings(),
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
