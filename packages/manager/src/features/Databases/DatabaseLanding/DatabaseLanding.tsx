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
import { DateTime, Interval } from 'luxon';
import { Typography } from 'src/components/Typography';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DatabaseInstance } from '@linode/api-v4';
import { useProfile } from 'src/queries/profile/profile';
import { formatDate } from 'src/utilities/formatDate';

const preferenceKey = 'databases';
const SUSPEND_EXPIRATION_DAYS = 180;
const SUSPEND_WARNING_DAYS = 150;

type SuspendNotification = {
  id: number;
  label: string;
  expirationCopy: string;
};

const DatabaseLanding = () => {
  const history = useHistory();
  const newDatabasesPagination = usePagination(1, preferenceKey, 'new');
  const legacyDatabasesPagination = usePagination(1, preferenceKey, 'legacy');
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  const {
    isDatabasesV2Enabled,
    isUserExistingBeta,
    isDatabasesV2GA,
    isUserNewBeta,
  } = useIsDatabasesEnabled();

  const { isLoading: isTypeLoading } = useDatabaseTypesQuery({
    platform: isDatabasesV2Enabled ? 'rdbms-default' : 'rdbms-legacy',
  });

  const isDefaultEnabled =
    isUserExistingBeta || isUserNewBeta || isDatabasesV2GA;

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
  const { data: profile } = useProfile();

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

  if (isUserExistingBeta || isDatabasesV2GA) {
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
    !isUserNewBeta
  );
  const isV2Enabled = isDatabasesV2Enabled || isDatabasesV2GA;
  const showTabs = isV2Enabled && !!legacyDatabases?.data.length;
  const isNewDatabase = isV2Enabled && !!newDatabases?.data.length;
  const showSuspend = isDatabasesV2GA && !!newDatabases?.data.length;

  const getSuspendNotification = (
    database: DatabaseInstance,
    lastUpdatedDate: string
  ) => {
    const lastUpdatedDt = DateTime.fromISO(lastUpdatedDate);
    const warningDate = lastUpdatedDt.plus({ days: SUSPEND_WARNING_DAYS });
    const expirationDate = lastUpdatedDt.plus({
      days: SUSPEND_EXPIRATION_DAYS,
    });
    const interval = Interval.fromDateTimes(warningDate, expirationDate);
    // Display warning banner if the current date is within the warning to expiration range
    if (interval.contains(DateTime.now())) {
      const expirationDateString = expirationDate.toUTC().toISO();
      const expirationCopy = expirationDateString
        ? `on ${formatDate(expirationDateString, {
            timezone: profile?.timezone,
            displayTime: false,
          })}`
        : `after ${SUSPEND_EXPIRATION_DAYS} days`;

      const newNotification = {
        id: database.id,
        label: database.label,
        expirationCopy: expirationCopy,
      };
      return newNotification;
    }
    return;
  };

  const suspendNotifications: SuspendNotification[] = React.useMemo(() => {
    const notifications: SuspendNotification[] = [];
    if (!showSuspend || newDatabases.data.length === 0) {
      return notifications;
    }
    // Loop through new databases to find suspended databases and check if a notification should be displayed.
    newDatabases.data.forEach((database) => {
      if (database.status === 'suspended') {
        const suspendNotification = getSuspendNotification(
          database,
          database.updated
        );
        if (suspendNotification) {
          notifications.push(suspendNotification);
        }
      }
    });
    return notifications;
  }, [newDatabases]);

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
        showSuspend={showSuspend}
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
      {showSuspend
        ? suspendNotifications.map((notification) => (
            <DismissibleBanner
              preferenceKey={`${notification.id}-suspend-notice`}
              variant="warning"
              key={`${notification.id}-key`}
            >
              <Box>
                <Typography>
                  {`${notification.label} has been suspended for ${SUSPEND_WARNING_DAYS} days. If it is not resumed to be operational it will be automatically deleted ${notification.expirationCopy}.`}
                </Typography>
              </Box>
            </DismissibleBanner>
          ))
        : null}
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
