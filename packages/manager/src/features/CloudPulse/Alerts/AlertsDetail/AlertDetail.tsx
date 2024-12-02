import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import React from 'react';
import { useParams } from 'react-router-dom';
import { BreadcrumbProps } from 'src/components/Breadcrumb/Breadcrumb';

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


  return (
    <React.Fragment>
      <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
      {/**
       * TODO,  The implementations of show details page will be added in upcoming PR's to keep this PR small
       */}
    </React.Fragment>
  );

}