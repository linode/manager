import { Box } from '@mui/material';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { DatabaseEmptyState } from 'src/features/Databases/DatabaseLanding/DatabaseEmptyState';
import DatabaseLandingTable from 'src/features/Databases/DatabaseLanding/DatabaseLandingTable';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { DatabaseClusterInfoBanner } from 'src/features/GlobalNotifications/DatabaseClusterInfoBanner';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import {
  useDatabaseTypesQuery,
  useDatabasesQuery,
} from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const preferenceKey = 'databases';

const DatabaseLanding = () => {
  const history = useHistory();
  const newDatabasesPagination = usePagination(1, preferenceKey, 'new');
  const legacyDatabasesPagination = usePagination(1, preferenceKey, 'legacy');
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  const {
    isDatabasesV2Enabled,
    isV2ExistingBetaUser,
    isV2GAUser,
    isV2NewBetaUser,
  } = useIsDatabasesEnabled();

  const { isLoading: isTypeLoading } = useDatabaseTypesQuery({
    platform: isDatabasesV2Enabled ? 'rdbms-default' : 'rdbms-legacy',
  });

  const isDefaultEnabled =
    isV2ExistingBetaUser || isV2NewBetaUser || isV2GAUser;

  const {
    handleOrderChange: newDatabaseHandleOrderChange,
    order: newDatabaseOrder,
    orderBy: newDatabaseOrderBy,
  } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `new-${preferenceKey}-order`
  );

  const newDatabasesFilter: Record<string, string> = {
    ['+order']: newDatabaseOrder,
    ['+order_by']: newDatabaseOrderBy,
    ['platform']: 'rdbms-default',
  };

  const {
    data: newDatabases,
    error: newDatabasesError,
    isLoading: newDatabasesIsLoading,
  } = useDatabasesQuery(
    {
      page: newDatabasesPagination.page,
      page_size: newDatabasesPagination.pageSize,
    },
    newDatabasesFilter,
    isDefaultEnabled
  );

  const {
    handleOrderChange: legacyDatabaseHandleOrderChange,
    order: legacyDatabaseOrder,
    orderBy: legacyDatabaseOrderBy,
  } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `legacy-${preferenceKey}-order`
  );

  const legacyDatabasesFilter: Record<string, string> = {
    ['+order']: legacyDatabaseOrder,
    ['+order_by']: legacyDatabaseOrderBy,
  };

  if (isV2ExistingBetaUser || isV2GAUser) {
    legacyDatabasesFilter['platform'] = 'rdbms-legacy';
  }

  const {
    data: legacyDatabases,
    error: legacyDatabasesError,
    isLoading: legacyDatabasesIsLoading,
  } = useDatabasesQuery(
    {
      page: legacyDatabasesPagination.page,
      page_size: legacyDatabasesPagination.pageSize,
    },
    legacyDatabasesFilter,
    !isV2NewBetaUser
  );

  const error = newDatabasesError || legacyDatabasesError;
  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your databases.')[0].reason
        }
      />
    );
  }

  if (newDatabasesIsLoading || legacyDatabasesIsLoading || isTypeLoading) {
    return <CircleProgress />;
  }

  const showEmpty = !newDatabases?.data.length && !legacyDatabases?.data.length;
  if (showEmpty) {
    return <DatabaseEmptyState />;
  }

  const isV2Enabled = isDatabasesV2Enabled || isV2GAUser;
  const showTabs = isV2Enabled && !!legacyDatabases?.data.length;
  const isNewDatabase = isV2Enabled && !!newDatabases?.data.length;

  const legacyTable = () => {
    return (
      <DatabaseLandingTable
        data={legacyDatabases?.data}
        handleOrderChange={legacyDatabaseHandleOrderChange}
        order={legacyDatabaseOrder}
        orderBy={legacyDatabaseOrderBy}
      />
    );
  };

  const defaultTable = () => {
    return (
      <DatabaseLandingTable
        data={newDatabases?.data}
        handleOrderChange={newDatabaseHandleOrderChange}
        isNewDatabase={true}
        order={newDatabaseOrder}
        orderBy={newDatabaseOrderBy}
      />
    );
  };

  const singleTable = () => {
    return isNewDatabase ? defaultTable() : legacyTable();
  };

  return (
    <React.Fragment>
      <LandingHeader
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Databases',
          }),
        }}
        createButtonText="Create Database Cluster"
        disabledCreateButton={isRestricted}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/managed-databases"
        onButtonClick={() => history.push('/databases/create')}
        title="Database Clusters"
      />
      {showTabs && <DatabaseClusterInfoBanner />}
      <Box>
        {showTabs ? (
          <Tabs>
            <TabList>
              <Tab>New Database Clusters</Tab>
              <Tab>Legacy Database Clusters</Tab>
            </TabList>
            <TabPanels>
              <SafeTabPanel index={0}>{defaultTable()}</SafeTabPanel>
              <SafeTabPanel index={1}>{legacyTable()}</SafeTabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          singleTable()
        )}
      </Box>
    </React.Fragment>
  );
};

export const databaseLandingLazyRoute = createLazyRoute('/databases')({
  component: DatabaseLanding,
});

export default React.memo(DatabaseLanding);
