import {
  ActiveLongviewPlan,
  LongviewClient,
  LongviewSubscription
} from '@linode/api-v4/lib/longview/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Search from 'src/components/DebouncedSearchTextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import withSettings, {
  Props as SettingsProps
} from 'src/containers/accountSettings.container';
import withLongviewClients, {
  Props as LongviewProps
} from 'src/containers/longview.container';
import withProfile from 'src/containers/profile.container';
import useFlags from 'src/hooks/useFlags';
import { State as StatsState } from 'src/store/longviewStats/longviewStats.reducer';
import { MapState } from 'src/store/types';
import LongviewPackageDrawer from '../LongviewPackageDrawer';
import { sumUsedMemory } from '../shared/utilities';
import { getFinalUsedCPU } from './Gauges/CPU';
import { generateUsedNetworkAsBytes } from './Gauges/Network';
import { getUsedStorage } from './Gauges/Storage';
import DeleteDialog from './LongviewDeleteDialog';
import LongviewList from './LongviewList';
import SubscriptionDialog from './SubscriptionDialog';

const useStyles = makeStyles((theme: Theme) => ({
  headingWrapper: {
    marginBottom: theme.spacing()
  },
  searchbar: {
    '&.MuiGrid-item': {
      paddingLeft: 0
    },
    '& > div': {
      width: '300px'
    },
    [theme.breakpoints.down('sm')]: {
      '&.MuiGrid-item': {
        paddingLeft: theme.spacing()
      }
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  },
  cta: {
    marginTop: theme.spacing(2)
  },
  sortSelect: {
    display: 'flex',
    alignItems: 'center',
    flexFlow: 'row nowrap',
    width: 210,
    [theme.breakpoints.up('xs')]: {
      width: 221
    }
  },
  selectLabel: {
    minWidth: '65px'
  },
  cmrSpacing: {
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginRight: 0
    }
  }
}));

interface Props {
  activeSubscription: ActiveLongviewPlan;
  handleAddClient: () => void;
  newClientLoading: boolean;
}

export type CombinedProps = Props &
  RouteComponentProps &
  LongviewProps &
  WithSnackbarProps &
  StateProps &
  // we need this to know if the account is managed
  SettingsProps &
  GrantsProps;

type SortKey = 'name' | 'cpu' | 'ram' | 'swap' | 'load' | 'network' | 'storage';

export const LongviewClients: React.FC<CombinedProps> = props => {
  const { getLongviewClients } = props;

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
  const flags = useFlags();

  React.useEffect(() => {
    getLongviewClients();
  }, [getLongviewClients]);

  const openDeleteDialog = React.useCallback((id: number, label: string) => {
    toggleDeleteDialog(true);
    setClientID(id);
    setClientLabel(label);
  }, []);

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

  /**
   * State and handlers for the Packages drawer
   * (setClientLabel and setClientID are reused from the delete dialog)
   */
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);

  const handleDrawerOpen = React.useCallback((id: number, label: string) => {
    setClientID(id);
    setClientLabel(label);
    setDrawerOpen(true);
  }, []);

  const {
    longviewClientsData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    lvClientData,
    accountSettings,
    activeSubscription,
    deleteLongviewClient,
    userCanCreateClient,
    handleAddClient,
    newClientLoading
  } = props;

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleSortKeyChange = (selected: Item<string>) => {
    setSortKey(selected.value as SortKey);
  };

  const isManaged = pathOr(false, ['managed'], accountSettings);

  // If this value is defined they're not on the free plan
  // and don't need to be CTA'd to upgrade.

  const isLongviewPro = !isEmpty(activeSubscription);

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
      <DocumentTitleSegment segment="Clients" />
      <Grid
        container
        className={`${classes.headingWrapper} ${flags.cmr &&
          classes.cmrSpacing}`}
        alignItems="center"
      >
        <Grid item className={classes.searchbar}>
          <Search
            placeholder="Filter by client label or hostname"
            label="Filter by client label or hostname"
            hideLabel
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
            label="Sort by"
            hideLabel
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
        openPackageDrawer={handleDrawerOpen}
        createLongviewClient={handleAddClient}
        loading={newClientLoading}
        userCanCreateLongviewClient={userCanCreateClient}
      />
      {!isLongviewPro && (
        <Grid
          className={classes.cta}
          container
          direction="column"
          alignItems="center"
          justify="center"
        >
          <Typography data-testid="longview-upgrade">
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
          isEmpty(activeSubscription)
            ? 10
            : (activeSubscription as LongviewSubscription).clients_included
        }
      />
      <LongviewPackageDrawer
        clientLabel={selectedClientLabel}
        clientID={selectedClientID || 0}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </React.Fragment>
  );
};

interface StateProps {
  lvClientData: StatsState;
}

/**
 * Calling connect directly here rather than use a
 * container because this is a unique case; we need
 * access to data from all clients.
 */
const mapStateToProps: MapState<StateProps, Props> = (state, _ownProps) => {
  const lvClientData = state.longviewStats ?? {};
  return {
    lvClientData
  };
};

const connected = connect(mapStateToProps);

interface GrantsProps {
  userCanCreateClient: boolean;
}

export default compose<CombinedProps, Props & RouteComponentProps>(
  React.memo,
  connected,
  withProfile<GrantsProps, {}>((ownProps, { profileData }) => {
    const isRestrictedUser = (profileData || {}).restricted;
    const hasAddLongviewGrant = pathOr<boolean>(
      false,
      ['grants', 'global', 'add_longview'],
      profileData
    );
    return {
      userCanCreateClient:
        !isRestrictedUser || (hasAddLongviewGrant && isRestrictedUser)
    };
  }),
  withLongviewClients(),
  withSettings(),
  withSnackbar
)(LongviewClients);

/**
 * Helper function for sortClientsBy,
 * to reduce (a>b) {return -1 } boilerplate
 */
export const sortFunc = (
  a: string | number,
  b: string | number,
  order: 'asc' | 'desc' = 'desc'
) => {
  let result: number;
  if (a > b) {
    result = -1;
  } else if (a < b) {
    result = 1;
  } else {
    result = 0;
  }
  return order === 'desc' ? result : -result;
};

/**
 * Handle sorting by various metrics,
 * since the calculations for each are
 * specific to that metric.
 *
 * This could be extracted to ./utilities,
 * but it's unlikely to be used anywhere else.
 */
export const sortClientsBy = (
  sortKey: SortKey,
  clients: LongviewClient[],
  clientData: StatsState
) => {
  switch (sortKey) {
    case 'name':
      return clients.sort((a, b) => {
        return sortFunc(a.label, b.label, 'asc');
      });
    case 'cpu':
      return clients.sort((a, b) => {
        const aCPU = getFinalUsedCPU(pathOr(0, [a.id, 'data'], clientData));
        const bCPU = getFinalUsedCPU(pathOr(0, [b.id, 'data'], clientData));

        return sortFunc(aCPU, bCPU);
      });
    case 'ram':
      return clients.sort((a, b) => {
        const aRam = sumUsedMemory(pathOr({}, [a.id, 'data'], clientData));
        const bRam = sumUsedMemory(pathOr({}, [b.id, 'data'], clientData));
        return sortFunc(aRam, bRam);
      });
    case 'swap':
      return clients.sort((a, b) => {
        const aSwap = pathOr<number>(
          0,
          [a.id, 'data', 'Memory', 'swap', 'used', 0, 'y'],
          clientData
        );
        const bSwap = pathOr<number>(
          0,
          [b.id, 'data', 'Memory', 'swap', 'used', 0, 'y'],
          clientData
        );
        return sortFunc(aSwap, bSwap);
      });
    case 'load':
      return clients.sort((a, b) => {
        const aLoad = pathOr<number>(
          0,
          [a.id, 'data', 'Load', 0, 'y'],
          clientData
        );
        const bLoad = pathOr<number>(
          0,
          [b.id, 'data', 'Load', 0, 'y'],
          clientData
        );
        return sortFunc(aLoad, bLoad);
      });
    case 'network':
      return clients.sort((a, b) => {
        const aNet = generateUsedNetworkAsBytes(
          pathOr(0, [a.id, 'data', 'Network', 'Interface'], clientData)
        );
        const bNet = generateUsedNetworkAsBytes(
          pathOr(0, [b.id, 'data', 'Network', 'Interface'], clientData)
        );
        return sortFunc(aNet, bNet);
      });
    case 'storage':
      return clients.sort((a, b) => {
        const aStorage = getUsedStorage(pathOr(0, [a.id, 'data'], clientData));
        const bStorage = getUsedStorage(pathOr(0, [b.id, 'data'], clientData));
        return sortFunc(aStorage, bStorage);
      });
    default:
      return clients;
  }
};

export const filterLongviewClientsByQuery = (
  query: string,
  clientList: LongviewClient[],
  clientData: StatsState
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
