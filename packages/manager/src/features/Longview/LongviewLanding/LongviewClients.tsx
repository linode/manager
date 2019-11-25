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
import { getFinalUsedCPU } from './Gauges/CPU';
import { getUsedStorage } from './Gauges/Storage';
import DeleteDialog from './LongviewDeleteDialog';
import LongviewList from './LongviewList';
import SubscriptionDialog from './SubscriptionDialog';

const useStyles = makeStyles((theme: Theme) => ({
  headingWrapper: {
    marginBottom: theme.spacing(1)
  },
  addNew: {
    marginLeft: 'auto'
  },
  searchbar: {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 'auto',
      '& >div': {
        width: '300px'
      }
    }
  },
  cta: {
    marginTop: theme.spacing(2)
  },
  lastUpdated: {
    marginBottom: theme.spacing(2)
  },
  sortSelect: {
    width: 210,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      width: 221
    }
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

type SortKey = 'name' | 'cpu' | 'ram' | 'swap' | 'load' | 'network' | 'storage';

export const LongviewClients: React.FC<CombinedProps> = props => {
  const [newClientLoading, setNewClientLoading] = React.useState<boolean>(
    false
  );
  const [deleteDialogOpen, toggleDeleteDialog] = React.useState<boolean>(false);
  const [selectedClientID, setClientID] = React.useState<number | undefined>(
    undefined
  );
  const [selectedClientLabel, setClientLabel] = React.useState<string>('');

  /** Handlers/tracking variables for sorting by different client attributes */

  const sortOptions: Item<string>[] = [
    {
      label: 'Client Name',
      value: 'name'
    },
    {
      label: 'CPU',
      value: 'cpu'
    },
    {
      label: 'RAM',
      value: 'ram'
    },
    {
      label: 'Swap',
      value: 'swap'
    },
    {
      label: 'Load',
      value: 'load'
    },
    {
      label: 'Network',
      value: 'network'
    },
    {
      label: 'Storage',
      value: 'storage'
    }
  ];

  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [query, setQuery] = React.useState<string>('');

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

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleSortKeyChange = (selected: Item<string>) => {
    setSortKey(selected.value as SortKey);
  };

  const _subscription = pathOr('', ['longview_subscription'], accountSettings);
  const activeSubscription = subscriptionsData.find(
    thisSubscription => thisSubscription.id === _subscription
  );

  const isManaged = pathOr(false, ['managed'], accountSettings);
  // If this value is defined they're not on the free plan
  // and don't need to be CTA'd to upgrade.
  const isLongviewPro = Boolean(
    pathOr(false, ['longview_subscription'], accountSettings)
  );

  /**
   * Do the actual sorting & filtering
   */

  const clients = Object.values(longviewClientsData);
  const filteredList = filterLongviewClientsByQuery(
    query,
    clients,
    lvClientData
  );
  const sortedList = sortClientsBy(sortKey, filteredList, lvClientData);

  return (
    <React.Fragment>
      <Grid container className={classes.headingWrapper} alignItems="center">
        <Grid item className={`py0 ${classes.searchbar}`}>
          <Search
            placeholder="Filter by client label or hostname"
            onSearch={handleSearch}
            debounceTime={250}
            small
          />
        </Grid>
        <Grid item className={`py0 ${classes.sortSelect}`}>
          <Typography className={classes.selectLabel}>Sort by: </Typography>
          <Select
            small
            isClearable={false}
            options={sortOptions}
            value={sortOptions.find(thisOption => thisOption.value === sortKey)}
            onChange={handleSortKeyChange}
          />
        </Grid>
        <Grid item className={`${classes.addNew} py0`}>
          <AddNewLink
            onClick={handleAddClient}
            label={newClientLoading ? 'Loading...' : 'Add a Client'}
          />
        </Grid>
      </Grid>
      <LongviewList
        filteredData={sortedList}
        longviewClientsError={longviewClientsError}
        longviewClientsLastUpdated={longviewClientsLastUpdated}
        longviewClientsLoading={longviewClientsLoading}
        longviewClientsResults={longviewClientsResults}
        triggerDeleteLongviewClient={openDeleteDialog}
        createLongviewClient={handleAddClient}
        loading={newClientLoading}
      />
      {!isLongviewPro && (
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
  const lvClientData = pathOr({}, ['longviewStats'], state);
  return {
    lvClientData
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

export const sortClientsBy = (
  sortKey: SortKey,
  clients: LongviewClient[],
  clientData: Record<string, StatsState>
) => {
  switch (sortKey) {
    case 'name':
      return clients.sort((a, b) => {
        if (a.label > b.label) {
          return 1;
        }
        if (a.label < b.label) {
          return -1;
        }
        return 0;
      });
    case 'cpu':
      return clients.sort((a, b) => {
        const aCPU = getFinalUsedCPU(clientData[a.id].data);
        const bCPU = getFinalUsedCPU(clientData[b.id].data);

        if (aCPU > bCPU) {
          return -1;
        }
        if (aCPU < bCPU) {
          return 1;
        }
        return 0;
      });
    case 'ram':
      return clients;
    case 'load':
      return clients.sort((a, b) => {
        const aLoad = pathOr<number>(
          0,
          ['Load', 0, 'y'],
          clientData[a.id].data
        );
        const bLoad = pathOr<number>(
          0,
          ['Load', 0, 'y'],
          clientData[b.id].data
        );
        if (aLoad > bLoad) {
          return -1;
        }
        if (aLoad < bLoad) {
          return 1;
        }
        return 0;
      });
    case 'storage':
      return clients.sort((a, b) => {
        const aStorage = getUsedStorage(clientData[a.id].data);
        const bStorage = getUsedStorage(clientData[b.id].data);
        if (aStorage > bStorage) {
          return -1;
        }
        if (aStorage < bStorage) {
          return 1;
        }
        return 0;
      });
    default:
      return clients;
  }
};

export const filterLongviewClientsByQuery = (
  query: string,
  clientList: LongviewClient[],
  clientData: Record<string, StatsState>
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
  const queryRegex = new RegExp(`${cleanedQuery}`, 'gmi');

  return clientList.filter(thisClient => {
    if (thisClient.label.match(queryRegex)) {
      return true;
    }

    // If the label didn't match, check the hostname
    const hostname = pathOr<string>(
      '',
      ['data', 'SysInfo', 'hostname'],
      clientData[thisClient.id]
    );
    if (hostname.match(queryRegex)) {
      return true;
    }

    return false;
  });
};
