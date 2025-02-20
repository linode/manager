import { Box, CircleProgress } from '@linode/ui';
import React from 'react';
import { useParams } from 'react-router-dom';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { useAlertDefinitionQuery } from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import { EditAlertDefinition } from './EditAlertDefinition';
import { EditAlertResources } from './EditAlertResources';

import type { AlertRouteParams } from '../AlertsDetail/AlertDetail';
import type { AlertServiceType } from '@linode/api-v4';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

const overrides = [
  {
    label: 'Definitions',
    linkTo: '/monitor/alerts/definitions',
    position: 1,
  },
  {
    label: 'Edit',
    linkTo: `/monitor/alerts/definitions/edit`,
    position: 2,
  },
];

export const EditAlertLanding = () => {
  const { alertId, serviceType } = useParams<AlertRouteParams>();
  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    alertId,
    serviceType
  );
  const newPathname = '/Definition/Edit';
  if (isFetching) {
    return getEditAlertMessage(<CircleProgress />, newPathname, overrides);
  }

  if (isError) {
    return getEditAlertMessage(
      <ErrorState
        errorText="
          An error occurred while loading the alerts definitions and resources. Please try again later."
      />,
      newPathname,
      overrides
    );
  }

  if (!alertDetails) {
    return getEditAlertMessage(
      <StyledPlaceholder icon={EntityIcon} title="No Data to display." />,
      newPathname,
      overrides
    );
  }

  if (alertDetails.type === 'system') {
    return (
      <EditAlertResources
        alertDetails={alertDetails}
        serviceType={serviceType as AlertServiceType}
      />
    );
  } else {
    return (
      <EditAlertDefinition
        alertDetails={alertDetails}
        serviceType={serviceType as AlertServiceType}
      />
    );
  }
};

/**
 * Returns a common UI structure for loading, error, or empty states.
 * @param messageComponent - A React component to display (e.g., CircleProgress, ErrorState, or Placeholder).
 * @param pathName - The current pathname to be provided in breadcrumb
 * @param crumbOverrides - The overrides to be provided in breadcrumb
 */
const getEditAlertMessage = (
  messageComponent: React.ReactNode,
  pathName: string,
  crumbOverrides: CrumbOverridesProps[]
) => {
  return (
    <>
      <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathName} />
      <Box alignContent="center" height="600px">
        {messageComponent}
      </Box>
    </>
  );
};
