import { Box, CircleProgress, ErrorState } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { useAlertDefinitionQuery } from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import { CloneAlertDefinition } from './CloneAlertDefinition';

import type { CloudPulseServiceType } from '@linode/api-v4';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

const overrides: CrumbOverridesProps[] = [
  {
    label: 'Definitions',
    linkTo: '/alerts/definitions',
    position: 1,
  },
];

export const CloneAlertLanding = () => {
  const { originalAlertId, serviceType } = useParams({
    from: '/alerts/definitions/clone/$serviceType/$originalAlertId',
  });

  const {
    data: alertDetails,
    isError,
    isLoading,
  } = useAlertDefinitionQuery(originalAlertId, serviceType);

  const pathname = '/Definition/Clone';

  if (isLoading) {
    return (
      <CloneAlertLoadingState overrides={overrides} pathname={pathname}>
        <CircleProgress />
      </CloneAlertLoadingState>
    );
  }

  if (isError) {
    return (
      <CloneAlertLoadingState overrides={overrides} pathname={pathname}>
        <ErrorState errorText="An error occurred while loading the alerts definitions and entities. Please try again later." />
      </CloneAlertLoadingState>
    );
  }

  if (!alertDetails) {
    return (
      <CloneAlertLoadingState overrides={overrides} pathname={pathname}>
        <StyledPlaceholder icon={EntityIcon} title="No Data to display." />
      </CloneAlertLoadingState>
    );
  }

  return (
    <CloneAlertDefinition
      alertDetails={alertDetails}
      serviceType={serviceType as CloudPulseServiceType}
    />
  );
};

const CloneAlertLoadingState = ({
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
