import { useDatabasesQuery, useDatabaseTypesQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { Box } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { DatabaseEmptyState } from 'src/features/Databases/DatabaseLanding/DatabaseEmptyState';
import DatabaseLandingTable from 'src/features/Databases/DatabaseLanding/DatabaseLandingTable';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const preferenceKey = 'databases';

export const DatabaseLanding = () => {
  const navigate = useNavigate();
  const newDatabasesPagination = usePaginationV2({
    currentRoute: '/databases',
    preferenceKey,
    queryParamsPrefix: 'new', // TODO (UIE-8634): Determine if we still need this prefix
  });
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  const { isDatabasesV2GA, isUserExistingBeta, isUserNewBeta } =
    useIsDatabasesEnabled();

  const { isLoading: isTypesLoading } = useDatabaseTypesQuery({
    platform: 'rdbms-default',
  });

  const isDefaultEnabled =
    isUserExistingBeta || isUserNewBeta || isDatabasesV2GA;

  const {
    handleOrderChange: databaseHandleOrderChange,
    order: databaseOrder,
    orderBy: databaseOrderBy,
  } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'desc',
        orderBy: 'label',
      },
      from: '/databases',
    },
    preferenceKey: `new-${preferenceKey}-order`, // TODO (UIE-8634): Determine if we still need 'new-' prefix
  });

  const databasesFilter: Record<string, string> = {
    ['+order']: databaseOrder,
    ['+order_by']: databaseOrderBy,
    ['platform']: 'rdbms-default',
  };

  const {
    data: databases,
    error: databasesError,
    isLoading: databasesIsLoading,
  } = useDatabasesQuery(
    {
      page: newDatabasesPagination.page,
      page_size: newDatabasesPagination.pageSize,
    },
    databasesFilter,
    isDefaultEnabled // TODO (UIE-8634): Determine if check if still necessary
  );

  if (databasesError) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(
            databasesError,
            'Error loading your databases.'
          )[0].reason
        }
      />
    );
  }

  if (databasesIsLoading || isTypesLoading) {
    return <CircleProgress />;
  }

  const showEmpty = !databases?.data.length;
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
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/aiven-database-clusters"
        onButtonClick={() => navigate({ to: '/databases/create' })}
        title="Database Clusters"
      />
      <Box>
        <DatabaseLandingTable
          data={databases?.data}
          handleOrderChange={databaseHandleOrderChange}
          isNewDatabase={true} // TODO (UIE-8634): Remove logic around isNewDatabase flag in LandingTable component
          order={databaseOrder}
          orderBy={databaseOrderBy}
          results={databases?.results}
        />
      </Box>
    </React.Fragment>
  );
};
