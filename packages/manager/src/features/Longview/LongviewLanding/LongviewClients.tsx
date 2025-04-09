import { Autocomplete, Typography } from '@linode/ui';
import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import withLongviewClients from 'src/containers/longview.container';
import { useAccountSettings, useGrants, useProfile } from '@linode/queries';

import { LongviewPackageDrawer } from '../LongviewPackageDrawer';
import { sumUsedMemory } from '../shared/utilities';
import { getFinalUsedCPU } from './Gauges/CPU';
import { generateUsedNetworkAsBytes } from './Gauges/Network';
import { getUsedStorage } from './Gauges/Storage';
import {
  StyledCTAGrid,
  StyledHeadingGrid,
  StyledSearchbarGrid,
  StyledSortSelectGrid,
} from './LongviewClients.styles';
import { LongviewDeleteDialog } from './LongviewDeleteDialog';
import { LongviewList } from './LongviewList';
import { SubscriptionDialog } from './SubscriptionDialog';

import type {
  ActiveLongviewPlan,
  LongviewClient,
  LongviewSubscription,
} from '@linode/api-v4/lib/longview/types';
import type { Props as LongviewProps } from 'src/containers/longview.container';
import type { LongviewState } from 'src/routes/longview';
import type { State as StatsState } from 'src/store/longviewStats/longviewStats.reducer';
import type { MapState } from 'src/store/types';

interface Props {
  activeSubscription: ActiveLongviewPlan;
  handleAddClient: () => void;
  newClientLoading: boolean;
}

interface SortOption {
  label: string;
  value: SortKey;
}

export type LongviewClientsCombinedProps = Props & LongviewProps & StateProps;

type SortKey = 'cpu' | 'load' | 'name' | 'network' | 'ram' | 'storage' | 'swap';

export const LongviewClients = (props: LongviewClientsCombinedProps) => {
  const { getLongviewClients } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LongviewState;
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: accountSettings } = useAccountSettings();

  const isRestrictedUser = Boolean(profile?.restricted);
  const hasAddLongviewGrant = Boolean(grants?.global?.add_longview);
  const isManaged = Boolean(accountSettings?.managed);

  const userCanCreateClient =
    !isRestrictedUser || (hasAddLongviewGrant && isRestrictedUser);

  const [deleteDialogOpen, toggleDeleteDialog] = React.useState<boolean>(false);
  const [selectedClientID, setClientID] = React.useState<number | undefined>(
    undefined
  );
  const [selectedClientLabel, setClientLabel] = React.useState<string>('');

  /** Handlers/tracking variables for sorting by different client attributes */
  const sortOptions: SortOption[] = [
    {
      label: 'Client Name',
      value: 'name',
    },
    {
      label: 'CPU',
      value: 'cpu',
    },
    {
      label: 'RAM',
      value: 'ram',
    },
    {
      label: 'Swap',
      value: 'swap',
    },
    {
      label: 'Load',
      value: 'load',
    },
    {
      label: 'Network',
      value: 'network',
    },
    {
      label: 'Storage',
      value: 'storage',
    },
  ];

  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [query, setQuery] = React.useState<string>('');

  /**
   * Subscription warning modal (shown when a user has used all of their plan's
   * available LV clients)
   */

  const [subscriptionDialogOpen, setSubscriptionDialogOpen] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    getLongviewClients();
  }, [getLongviewClients]);

  const openDeleteDialog = React.useCallback((id: number, label: string) => {
    toggleDeleteDialog(true);
    setClientID(id);
    setClientLabel(label);
  }, []);

  const handleSubmit = () => {
    if (isManaged) {
      navigate({
        state: (prev) => ({ ...prev, ...locationState }),
        to: '/support/tickets',
      });
      return;
    }
    navigate({
      to: '/longview/plan-details',
    });
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
    activeSubscription,
    deleteLongviewClient,
    handleAddClient,
    longviewClientsData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    lvClientData,
    newClientLoading,
  } = props;

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleSortKeyChange = (selected: SortOption) => {
    setSortKey(selected.value);
  };

  // If this value is defined they're not on the free plan
  // and don't need to be CTA'd to upgrade.

  const isLongviewPro = Object.keys(activeSubscription).length > 0;
  /**
   * Do the actual sorting & filtering
   */

  const clients: LongviewClient[] = Object.values(longviewClientsData);
  const filteredList = filterLongviewClientsByQuery(
    query,
    clients,
    lvClientData
  );
  const sortedList = sortClientsBy(sortKey, filteredList, lvClientData);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Clients" />
      <StyledHeadingGrid container spacing={2}>
        <StyledSearchbarGrid>
          <DebouncedSearchTextField
            clearable
            debounceTime={250}
            hideLabel
            label="Filter by client label or hostname"
            onSearch={handleSearch}
            placeholder="Filter by client label or hostname"
            value={query}
          />
        </StyledSearchbarGrid>
        <StyledSortSelectGrid>
          <Typography sx={{ minWidth: '65px' }}>Sort by: </Typography>
          <Autocomplete
            onChange={(_, value) => {
              handleSortKeyChange(value);
            }}
            textFieldProps={{
              hideLabel: true,
            }}
            value={sortOptions.find(
              (thisOption) => thisOption.value === sortKey
            )}
            disableClearable
            fullWidth
            label="Sort by"
            options={sortOptions}
            size="small"
          />
        </StyledSortSelectGrid>
      </StyledHeadingGrid>
      <LongviewList
        createLongviewClient={handleAddClient}
        filteredData={sortedList}
        loading={newClientLoading}
        longviewClientsError={longviewClientsError}
        longviewClientsLastUpdated={longviewClientsLastUpdated}
        longviewClientsLoading={longviewClientsLoading}
        longviewClientsResults={longviewClientsResults}
        openPackageDrawer={handleDrawerOpen}
        triggerDeleteLongviewClient={openDeleteDialog}
        userCanCreateLongviewClient={userCanCreateClient}
      />
      {!isLongviewPro && (
        <StyledCTAGrid container spacing={2}>
          <Typography data-testid="longview-upgrade">
            <Link to={'/longview/plan-details'}>Upgrade to Longview Pro</Link>
            {` `}for more clients, longer data retention, and more frequent data
            updates.
          </Typography>
        </StyledCTAGrid>
      )}
      <LongviewDeleteDialog
        closeDialog={() => toggleDeleteDialog(false)}
        deleteClient={deleteLongviewClient}
        open={deleteDialogOpen}
        selectedLongviewClientID={selectedClientID}
        selectedLongviewClientLabel={selectedClientLabel}
      />
      <SubscriptionDialog
        clientLimit={
          Object.entries(activeSubscription).length === 0
            ? 10
            : (activeSubscription as LongviewSubscription).clients_included
        }
        isManaged={isManaged}
        isOpen={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        onSubmit={handleSubmit}
      />
      <LongviewPackageDrawer
        clientID={selectedClientID || 0}
        clientLabel={selectedClientLabel}
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
    lvClientData,
  };
};

const connected = connect(mapStateToProps);

export default compose<LongviewClientsCombinedProps, Props>(
  React.memo,
  connected,
  withLongviewClients()
)(LongviewClients);

/**
 * Helper function for sortClientsBy,
 * to reduce (a>b) {return -1 } boilerplate
 */
export const sortFunc = (
  a: number | string,
  b: number | string,
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
        const aCPU = getFinalUsedCPU(clientData?.[a.id]?.data ?? {});
        const bCPU = getFinalUsedCPU(clientData?.[b.id]?.data ?? {});
        return sortFunc(aCPU, bCPU);
      });
    case 'ram':
      return clients.sort((a, b) => {
        const aRam = sumUsedMemory(clientData?.[a.id]?.data ?? {});
        const bRam = sumUsedMemory(clientData?.[b.id]?.data ?? {});
        return sortFunc(aRam, bRam);
      });
    case 'swap':
      return clients.sort((a, b) => {
        const aSwap = clientData?.[a.id]?.data?.Memory?.swap?.used?.[0]?.y ?? 0;
        const bSwap = clientData?.[b.id]?.data?.Memory?.swap?.used?.[0]?.y ?? 0;
        return sortFunc(aSwap, bSwap);
      });
    case 'load':
      return clients.sort((a, b) => {
        const aLoad = clientData?.[a.id]?.data?.Load?.[0]?.y ?? 0;
        const bLoad = clientData?.[b.id]?.data?.Load?.[0]?.y ?? 0;
        return sortFunc(aLoad, bLoad);
      });
    case 'network':
      return clients.sort((a, b) => {
        const aNet = generateUsedNetworkAsBytes(
          clientData?.[a.id]?.data?.Network?.Interface ?? {}
        );
        const bNet = generateUsedNetworkAsBytes(
          clientData?.[b.id]?.data?.Network?.Interface ?? {}
        );
        return sortFunc(aNet, bNet);
      });
    case 'storage':
      return clients.sort((a, b) => {
        const aStorage = getUsedStorage(clientData?.[a.id]?.data ?? {});
        const bStorage = getUsedStorage(clientData?.[b.id]?.data ?? {});
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

  return clientList.filter((thisClient) => {
    if (thisClient.label.match(queryRegex)) {
      return true;
    }

    // If the label didn't match, check the hostname
    const hostname = clientData[thisClient.id]?.data?.SysInfo?.hostname ?? '';
    if (hostname.match(queryRegex)) {
      return true;
    }

    return false;
  });
};
