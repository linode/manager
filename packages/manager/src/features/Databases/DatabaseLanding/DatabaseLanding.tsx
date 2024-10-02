import { Box } from '@mui/material';
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

import { DatabaseEmptyState } from './DatabaseEmptyState';

const preferenceKey = 'databases';

const DatabaseLanding = () => {
  const history = useHistory();
  const newDatabasesPagination = usePagination(1, preferenceKey, 'new');
  const legacyDatabasesPagination = usePagination(1, preferenceKey, 'legacy');
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  const { isDatabasesV2Enabled } = useIsDatabasesEnabled();
  const { isLoading: isTypeLoading } = useDatabaseTypesQuery({
    platform: isDatabasesV2Enabled ? 'rdbms-default' : 'rdbms-legacy',
  });

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
  };

  if (isDatabasesV2Enabled) {
    newDatabasesFilter['platform'] = 'rdbms-default';
  }

  const {
    data: newDatabases,
    error: newDatabasesError,
    isLoading: newDatabasesIsLoading,
  } = useDatabasesQuery(
    {
      page: newDatabasesPagination.page,
      page_size: newDatabasesPagination.pageSize,
    },
    newDatabasesFilter
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

  if (isDatabasesV2Enabled) {
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
    legacyDatabasesFilter
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

  const showTabs = isDatabasesV2Enabled && legacyDatabases?.data.length !== 0;

  const showEmpty =
    newDatabases?.data.length === 0 && legacyDatabases?.data.length === 0;

  if (showEmpty) {
    return <DatabaseEmptyState />;
  }

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
              <Tab>Legacy Database Clusters</Tab>
              <Tab>New Database Clusters</Tab>
            </TabList>
            <TabPanels>
              <SafeTabPanel index={0}>
                <DatabaseLandingTable
                  data={legacyDatabases?.data}
                  handleOrderChange={legacyDatabaseHandleOrderChange}
                  order={legacyDatabaseOrder}
                  orderBy={legacyDatabaseOrderBy}
                />
              </SafeTabPanel>
              <SafeTabPanel index={1}>
                <DatabaseLandingTable
                  data={newDatabases?.data}
                  handleOrderChange={newDatabaseHandleOrderChange}
                  isNewDatabase={true}
                  order={newDatabaseOrder}
                  orderBy={newDatabaseOrderBy}
                />
              </SafeTabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <DatabaseLandingTable
            data={
              isDatabasesV2Enabled ? newDatabases?.data : legacyDatabases?.data
            }
            handleOrderChange={
              isDatabasesV2Enabled
                ? newDatabaseHandleOrderChange
                : legacyDatabaseHandleOrderChange
            }
            order={
              isDatabasesV2Enabled ? newDatabaseOrder : legacyDatabaseOrder
            }
            orderBy={
              isDatabasesV2Enabled ? newDatabaseOrderBy : legacyDatabaseOrderBy
            }
            isNewDatabase={isDatabasesV2Enabled}
          />
        )}
      </Box>
    </React.Fragment>
  );
};

export default React.memo(DatabaseLanding);
