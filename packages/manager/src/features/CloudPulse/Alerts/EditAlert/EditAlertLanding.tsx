import { Box, CircleProgress, ErrorState } from '@linode/ui';
import React from 'react';
import { useParams } from 'react-router-dom';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
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
    linkTo: '/alerts/definitions',
    position: 1,
  },
  {
    label: 'Edit',
    linkTo: `/alerts/definitions/edit`,
    position: 2,
  },
];

export const EditAlertLanding = () => {
  const { alertId, serviceType } = useParams<AlertRouteParams>();
  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    alertId,
    serviceType
  );
  const pathname = '/Definition/Edit';

  if (isFetching) {
    return (
      <EditAlertLoadingState overrides={overrides} pathname={pathname}>
        <CircleProgress />
      </EditAlertLoadingState>
    );
  }

  if (isError) {
    return (
      <EditAlertLoadingState overrides={overrides} pathname={pathname}>
        <ErrorState errorText="An error occurred while loading the alerts definitions and entities. Please try again later." />
      </EditAlertLoadingState>
    );
  }

  if (!alertDetails) {
    return (
      <EditAlertLoadingState overrides={overrides} pathname={pathname}>
        <StyledPlaceholder icon={EntityIcon} title="No Data to display." />
      </EditAlertLoadingState>
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
 * A component that renders a common UI structure for loading, error, or empty states.
 * @param pathname - The current pathname to be provided in breadcrumb
 * @param crumbOverrides - The overrides to be provided in breadcrumb
 * @param children - The message component (e.g., CircleProgress, ErrorState, or Placeholder)
 */
const EditAlertLoadingState = ({
  children,
  overrides,
  pathname,
}: {
  children: React.ReactNode;
  overrides: CrumbOverridesProps[];
  pathname: string;
}) => {
  return (
    <>
      <Breadcrumb crumbOverrides={overrides} pathname={pathname} />
      <Box alignContent="center" height="600px">
        {children}
      </Box>
    </>
  );
};
