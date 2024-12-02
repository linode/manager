import { CircleProgress } from '@linode/ui';
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

  if (isFetching) {
    return <CircleProgress />;
  }

  if (isError) {
    return (
      <>
        <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
        <ErrorState errorText={'Error loading alert details.'} />
      </>
    );
  }

  return (
    <React.Fragment>
      <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
      {/**
       * TODO,  The implementations of show details page by use of data from useAlertDefinitionQuery will be added in upcoming PR's to keep this PR small
       */}
    </React.Fragment>
  );
};
