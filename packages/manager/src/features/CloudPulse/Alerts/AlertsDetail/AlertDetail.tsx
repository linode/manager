import { Box, CircleProgress } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { useAlertDefinitionQuery } from 'src/queries/cloudpulse/alerts';

import type { BreadcrumbProps } from 'src/components/Breadcrumb/Breadcrumb';

interface RouteParams {
  /*
   * The id of the alert for which the data needs to be shown
   */
  alertId: string;
  /*
   * The service type like linode, dbaas etc., of the the alert for which the data needs to be shown
   */
  serviceType: string;
}

export const AlertDetail = () => {
  const { alertId, serviceType } = useParams<RouteParams>();

  const { isError, isFetching } = useAlertDefinitionQuery(
    Number(alertId),
    serviceType
  );

  const { crumbOverrides, pathname } = React.useMemo((): BreadcrumbProps => {
    const overrides = [
      {
        label: 'Definitions',
        linkTo: '/monitor/alerts/definitions',
        position: 1,
      },
      {
        label: 'Details',
        linkTo: `/monitor/alerts/definitions/details/${serviceType}/${alertId}`,
        position: 2,
      },
    ];
    return { crumbOverrides: overrides, pathname: '/Definitions/Details' };
  }, [alertId, serviceType]);

  const theme = useTheme();

  if (isFetching) {
    return (
      <Box alignContent="center" height={theme.spacing(75)}>
        <CircleProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box alignContent="center" height={theme.spacing(75)}>
        <ErrorState
          errorText={
            'An error occurred while loading the definitions. Please try again later.'
          }
        />
      </Box>
    );
  }
  // TODO: The overview, criteria, resources details for alerts will be added in upcoming PR's by consuming the results of useAlertDefinitionQuery call
  return <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />;
};
