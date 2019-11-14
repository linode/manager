import {
  LongviewClient,
  LongviewSubscription
} from 'linode-js-sdk/lib/longview/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Search from 'src/components/DebouncedSearchTextField';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import withSettings, {
  SettingsProps
} from 'src/containers/accountSettings.container';
import withLongviewClients, {
  Props as LongviewProps
} from 'src/containers/longview.container';
import { State as StatsState } from 'src/store/longviewStats/longviewStats.reducer';
import { MapState } from 'src/store/types';
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
  },
  cta: {
    marginTop: theme.spacing(2)
  },
  lastUpdated: {
    marginBottom: theme.spacing(2)
  },
  sortSelect: {
    marginBottom: theme.spacing(2),
    width: '300px',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  selectLabel: {
    minWidth: '65px'
  }
}));

interface Props {
  subscriptionsData: LongviewSubscription[];
}

type CombinedProps = Props &
  RouteComponentProps &
  LongviewProps &
  WithSnackbarProps &
  StateProps &
  SettingsProps;

/**
 * Returns a date string representing the time
 * when the most recently updated Longview client
 * was updated.
 *
 */
export const getLastUpdated = (lvClientData: Record<string, StatsState>) => {
  const updated = Object.values(lvClientData).reduce((accum, thisClient) => {
    return thisClient.lastUpdated > accum ? thisClient.lastUpdated : accum;
  }, 0) as number;
  return new Date(updated).toUTCString();
};

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

  /** Handlers/tracking variables for sorting by different client attributes */

  type SortKey = 'name' | 'cpu';
  const sortOptions: Item<string>[] = [
    {
      label: 'Client Name',
      value: 'name'
    },
    {
      label: 'CPU',
      value: 'cpu'
    }
  ];

  const [sortKey, setSortKey] = React.useState<SortKey>('name');

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
    lvClientData,
    accountSettings,
    subscriptionsData,
    createLongviewClient,
    deleteLongviewClient
  } = props;

  const handleSearch = (query: string) => {
    return filterClientList(
      filterLongviewClientsByQuery(query, longviewClientsData)
    );
  };

  const handleSortKeyChange = (selected: Item) => {
    setSortKey(selected.value as SortKey);
  };

  const _subscription = pathOr('', ['longview_subscription'], accountSettings);
  const activeSubscription = subscriptionsData.find(
    thisSubscription => thisSubscription.id === _subscription
  );

  const isManaged = pathOr(false, ['managed'], accountSettings);

  const lastUpdated = React.useMemo(() => getLastUpdated(lvClientData), [
    lvClientData
  ]);

  return (
    <React.Fragment>
      <Grid container className={classes.headingWrapper} alignItems="center">
        <Grid item className={`pt0 ${classes.searchbar}`}>
          <Search onSearch={handleSearch} debounceTime={250} />
        </Grid>
        <Grid item className={`pt0 ${classes.sortSelect}`}>
          <Typography className={classes.selectLabel}>Sort by: </Typography>
          <Select
            isClearable={false}
            options={sortOptions}
            value={sortOptions.find(thisOption => thisOption.value === sortKey)}
            onChange={handleSortKeyChange}
          />
        </Grid>
        <Grid item className={`pt0 ${classes.lastUpdated}`}>
          <Typography>
            Data last updated at <DateTimeDisplay value={lastUpdated} />
          </Typography>
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
      {true && (
        <Grid
          className={classes.cta}
          container
          direction="column"
          alignItems="center"
          justify="center"
        >
          <Typography>
            <Link to={'/longview/plan-details'}>Upgrade to Longview Pro</Link>
            {` `}for more clients, longer data retention, and more frequent data
            updates.
          </Typography>
        </Grid>
      )}
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
        clientLimit={
          activeSubscription ? activeSubscription.clients_included : 10
        }
      />
    </React.Fragment>
  );
};

/**
 * Calling connect directly here rather than use a
 * container because this is a unique case; we need
 * access to data from all clients.
 */
interface StateProps {
  lvClientData: Record<string, StatsState>;
}

const mapStateToProps: MapState<StateProps, Props> = (state, ownProps) => {
  return {
    lvClientData: pathOr({}, ['longviewStats'], state)
  };
};

const connected = connect(mapStateToProps);

export default compose<CombinedProps, Props & RouteComponentProps>(
  React.memo,
  connected,
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
