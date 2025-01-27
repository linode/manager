import { Box, CircleProgress } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  useAlertDefinitionQuery,
} from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import { AlertResources } from '../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../Utils/utils';

import type { AlertRouteParams } from '../AlertsDetail/AlertDetail';

export const EditAlertResources = () => {
  const { alertId, serviceType } = useParams<AlertRouteParams>();

  const theme = useTheme();

  const definitionLanding = '/monitor/alerts/definitions';

  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    Number(alertId),
    serviceType
  );

  // const {
  //   isError: isEditAlertError,
  //   mutateAsync: editAlert,
  //   reset: resetEditAlert,
  // } = useEditAlertDefinitionResources(serviceType, Number(alertId));

  React.useEffect(() => {
    setSelectedResources(
      alertDetails ? alertDetails.entity_ids.map((id) => Number(id)) : []
    );
  }, [alertDetails]);

  const { newPathname, overrides } = React.useMemo(() => {
    const overrides = [
      {
        label: 'Definitions',
        linkTo: definitionLanding,
        position: 1,
      },
      {
        label: 'Edit',
        linkTo: `${definitionLanding}/edit/${serviceType}/${alertId}`,
        position: 2,
      },
    ];

    return { newPathname: '/Definitions/Edit', overrides };
  }, [serviceType, alertId]);

  const [, setSelectedResources] = React.useState<number[]>(
    []
  );

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

  if (isError) {
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

  const handleResourcesSelection = (resourceIds: string[]) => {
    setSelectedResources(resourceIds.map((id) => Number(id))); // here we just keep track of it, on save we will update it
  };

  return (
    <>
      <Breadcrumb crumbOverrides={overrides} pathname={newPathname} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          ...getAlertBoxStyles(theme),
        }}
      >
        <Box>
          <AlertResources
            alertLabel={alertDetails.label}
            alertResourceIds={alertDetails.entity_ids}
            handleResourcesSelection={handleResourcesSelection}
            isSelectionsNeeded
            serviceType={alertDetails.service_type}
          />
        </Box>
      </Box>
    </>
  )
};