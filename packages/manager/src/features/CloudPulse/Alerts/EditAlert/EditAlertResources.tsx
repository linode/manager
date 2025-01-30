import { Box, CircleProgress } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  useAlertDefinitionQuery,
  useEditAlertDefinition,
} from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import { AlertResources } from '../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../Utils/utils';

import type { AlertRouteParams } from '../AlertsDetail/AlertDetail';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

export const EditAlertResources = () => {
  const { alertId, serviceType } = useParams<AlertRouteParams>();

  const theme = useTheme();

  const definitionLanding = '/monitor/alerts/definitions';

  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    Number(alertId),
    serviceType
  );

  const {} = useEditAlertDefinition(serviceType, Number(alertId)); // TODO: consume mutate, error from hook and implement save resources in upcoming PR

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
    return getEditAlertMessage(<CircleProgress />, newPathname, overrides);
  }

  if (isError) {
    return getEditAlertMessage(
      <ErrorState
        errorText={
          'An error occurred while loading the alerts definitions and resources. Please try again later.'
        }
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

  const handleResourcesSelection = (resourceIds: string[]) => {
    setSelectedResources(resourceIds.map((id) => id)); // keep track of the selected resources and update it on save
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
        <AlertResources
          alertLabel={label}
          alertResourceIds={entity_ids}
          handleResourcesSelection={handleResourcesSelection}
          isSelectionsNeeded
          serviceType={service_type}
        />
      </Box>
    </>
  );
};

/**
 * Returns a common UI structure for loading, error, or empty states.
 * @param content - A React component to display (e.g., CircleProgress, ErrorState, or Placeholder).
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
