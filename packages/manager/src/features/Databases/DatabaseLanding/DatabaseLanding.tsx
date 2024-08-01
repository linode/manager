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
import DatabaseLandingTable from 'src/features/Databases/DatabaseLanding/DatabaseLandingTable';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAccount } from 'src/queries/account/account';
import {
  useDatabaseTypesQuery,
  useDatabasesQuery,
} from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { DatabaseEmptyState } from './DatabaseEmptyState';
import { DatabaseRow } from './DatabaseRow';

import type { DatabaseInstance } from '@linode/api-v4/lib/databases';
import { getRestrictedResourceText } from 'src/features/Account/utils';

const preferenceKey = 'databases';

const DatabaseLanding = () => {
  const history = useHistory();
  const pagination = usePagination(1, preferenceKey);
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });
  const account = useAccount();

  const { data: types, isLoading: isTypeLoading } = useDatabaseTypesQuery();

  const {
    handleOrderChange: aDatabaseHandleOrderChange,
    order: aDatabaseOrder,
    orderBy: aDatabaseOrderBy,
  } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const {
    handleOrderChange: bDatabaseHandleOrderChange,
    order: bDatabaseOrder,
    orderBy: bDatabaseOrderBy,
  } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: aDatabaseOrder,
    ['+order_by']: aDatabaseOrderBy,
  };

  const { data, error, isLoading } = useDatabasesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  // TODO change platform value when it's ready
  const aDatabases: DatabaseInstance[] = [];
  const bDatabases: DatabaseInstance[] = [];
  data?.data.forEach((database: DatabaseInstance) => {
    return database.platform === 'adb'
      ? aDatabases?.push(database)
      : bDatabases?.push(database);
  });

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your databases.')[0].reason
        }
      />
    );
  }

  if (isLoading || isTypeLoading) {
    return <CircleProgress />;
  }

  // TODO Update if necessary after agreement
  const isDisplayFlowA = account.data?.capabilities.includes(
    'Managed Databases Beta'
  );

  if (isDisplayFlowA && aDatabases.length === 0) {
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
        docsLink="https://www.linode.com/docs/products/databases/managed-databases/"
        onButtonClick={() => history.push('/databases/create')}
        title="Database Clusters"
      />
      <Box sx={{ marginTop: '15px' }}>
        {!isDisplayFlowA ? (
          <Tabs>
            <TabList>
              <Tab>Legacy Database Clusters</Tab>
              <Tab>Aiven Database Clusters</Tab>
            </TabList>
            <TabPanels>
              <SafeTabPanel index={0}>
                <DatabaseLandingTable
                  data={bDatabases}
                  handleOrderChange={bDatabaseHandleOrderChange}
                  order={bDatabaseOrder}
                  orderBy={bDatabaseOrderBy}
                  types={types}
                />
              </SafeTabPanel>
              <SafeTabPanel index={1}>
                <DatabaseLandingTable
                  data={aDatabases}
                  handleOrderChange={aDatabaseHandleOrderChange}
                  isADatabases={true}
                  order={aDatabaseOrder}
                  orderBy={aDatabaseOrderBy}
                  types={types}
                />
              </SafeTabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <DatabaseLandingTable
            data={aDatabases}
            handleOrderChange={aDatabaseHandleOrderChange}
            isADatabases={true}
            order={aDatabaseOrder}
            orderBy={aDatabaseOrderBy}
            types={types}
          />
        )}
      </Box>
    </React.Fragment>
  );
};

export default React.memo(DatabaseLanding);
