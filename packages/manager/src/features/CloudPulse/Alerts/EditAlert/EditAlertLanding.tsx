import { Box, CircleProgress } from '@linode/ui';
import { useTheme } from '@mui/material';
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
  const theme = useTheme();
  const { alertId, serviceType } = useParams<AlertRouteParams>();
  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    Number(alertId),
    serviceType
  );
  const newPathname = '/Definition/Edit';
  if (isFetching) {
    return (
      <>
        <Breadcrumb crumbOverrides={overrides} pathname={newPathname} />
        <Box alignContent="center" height={theme.spacing(75)}>
          <CircleProgress />
        </Box>
      </>
    );
  }
  if (isError && !isFetching) {
    return (
      <>
        <Breadcrumb crumbOverrides={overrides} pathname={newPathname} />
        <Box alignContent="center" height={theme.spacing(75)}>
          <ErrorState
            errorText={
              'An error occurred while loading the alerts definitions and resources. Please try again later.'
            }
          />
        </Box>
      </>
    );
  }

  if (!alertDetails) {
    return (
      <>
        <Breadcrumb crumbOverrides={overrides} pathname={newPathname} />
        <Box alignContent="center" height={theme.spacing(75)}>
          <StyledPlaceholder icon={EntityIcon} title="No Data to display." />
        </Box>
      </>
    );
  }
  if (alertDetails.type === 'system' || alertDetails.type === 'default') {
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
