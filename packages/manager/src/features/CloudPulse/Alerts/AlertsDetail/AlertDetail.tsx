import { Box, Chip, CircleProgress } from '@linode/ui';
import { styled, useTheme } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

import AlertsIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { useAlertDefinitionQuery } from 'src/queries/cloudpulse/alerts';

import { getAlertBoxStyles } from '../Utils/utils';
import { AlertDetailCriteria } from './AlertDetailCriteria';
import { AlertDetailOverview } from './AlertDetailOverview';

interface RouteParams {
  /**
   * The id of the alert for which the data needs to be shown
   */
  alertId: string;
  /**
   * The service type like linode, dbaas etc., of the the alert for which the data needs to be shown
   */
  serviceType: string;
}

export const AlertDetail = () => {
  const { alertId, serviceType } = useParams<RouteParams>();

  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    Number(alertId),
    serviceType
  );

  const { crumbOverrides, pathname } = React.useMemo(() => {
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
      <>
        <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
        <Box alignContent="center" height={theme.spacing(75)}>
          <CircleProgress />
        </Box>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
        <Box alignContent="center" height={theme.spacing(75)}>
          <ErrorState errorText="An error occurred while loading the definitions. Please try again later." />
        </Box>
      </>
    );
  }

  if (!alertDetails) {
    return (
      <>
        <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
        <Box alignContent="center" height={theme.spacing(75)}>
          <StyledPlaceholder
            icon={AlertsIcon}
            isEntity
            title="No data to display."
          />
        </Box>
      </>
    );
  }
  // TODO: The criteria, resources details for alerts will be added by consuming the results of useAlertDefinitionQuery call in the coming PR's
  return (
    <>
      <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" flexDirection={{ md: 'row', xs: 'column' }} gap={2}>
          <Box
            flexBasis="50%"
            maxHeight={theme.spacing(98.125)}
            sx={{ ...getAlertBoxStyles(theme), overflow: 'auto' }}
          >
            <AlertDetailOverview alertDetails={alertDetails} />
          </Box>
          <Box
            sx={{
              ...getAlertBoxStyles(theme),
              overflow: 'auto',
            }}
            flexBasis="50%"
            maxHeight={theme.spacing(98.125)}
          >
            <AlertDetailCriteria alert={alertDetails} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export const StyledPlaceholder = styled(Placeholder, {
  label: 'StyledPlaceholder',
})(({ theme }) => ({
  h1: {
    fontSize: theme.spacing(2),
  },
  svg: {
    maxHeight: theme.spacing(10),
  },
}));

export const StyledAlertChip = styled(Chip, {
  label: 'StyledAlertChip',
  shouldForwardProp: (prop) => prop !== 'borderRadius',
})<{
  borderRadius?: string;
}>(({ borderRadius, theme }) => ({
  '& .MuiChip-label': {
    color: theme.tokens.color.Neutrals.Black,
    marginRight: theme.spacing(1), // Add padding inside the label
  },
  backgroundColor: theme.tokens.color.Neutrals.White,
  borderRadius: borderRadius || 0,
  height: theme.spacing(3),
  lineHeight: '1.5rem',
}));
