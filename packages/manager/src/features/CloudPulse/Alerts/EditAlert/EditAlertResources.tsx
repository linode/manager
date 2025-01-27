import { Box, CircleProgress } from '@linode/ui';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useParams } from 'react-router-dom';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  useAlertDefinitionQuery,
  useEditAlertDefinitionResources,
} from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import { AlertResources } from '../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../Utils/utils';

import type { AlertRouteParams } from '../AlertsDetail/AlertDetail';

export const EditAlertResources = () => {
  const { alertId, serviceType } = useParams<AlertRouteParams>();

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const definitionLanding = '/monitor/alerts/definitions';

  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    Number(alertId),
    serviceType
  );

  const {
    isError: isEditAlertError,
    reset: resetEditAlert,
  } = useEditAlertDefinitionResources(serviceType, Number(alertId)); // TODO: consume mutate and implement save resources in upcoming PR

  React.useEffect(() => {
    setSelectedResources(
      alertDetails ? alertDetails.entity_ids.map((id) => id) : []
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

  const [, setSelectedResources] = React.useState<string[]>([]);

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

  if (isEditAlertError) {
    enqueueSnackbar('Error while updating the resources. Try again later.', {
      anchorOrigin: {
        horizontal: 'right',
        vertical: 'top', // show snackbar at the top
      },
      autoHideDuration: 5000,
      style: {
        marginTop: theme.spacing(18.75),
      },
      variant: 'error',
    });
    resetEditAlert(); // reset the mutate use hook states
  }

  const handleResourcesSelection = (resourceIds: string[]) => {
    setSelectedResources(resourceIds.map((id) => id)); // here we just keep track of it, on save we will update it
  };

  const { entity_ids, label, service_type } = alertDetails;

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
            alertLabel={label}
            alertResourceIds={entity_ids}
            handleResourcesSelection={handleResourcesSelection}
            isSelectionsNeeded
            serviceType={service_type}
          />
        </Box>
      </Box>
    </>
  );
};
