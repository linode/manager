import {
  Box,
  Chip,
  CircleProgress,
  ErrorState,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import { Link, styled, useTheme } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

import AlertsIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { useAlertDefinitionQuery } from 'src/queries/cloudpulse/alerts';

import { AlertResources } from '../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../Utils/utils';
import { AlertDetailCriteria } from './AlertDetailCriteria';
import { AlertDetailNotification } from './AlertDetailNotification';
import { AlertDetailOverview } from './AlertDetailOverview';

export interface AlertRouteParams {
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
  const { alertId, serviceType } = useParams<AlertRouteParams>();

  const {
    data: alertDetails,
    isError,
    isLoading,
  } = useAlertDefinitionQuery(alertId, serviceType);

  const { crumbOverrides, pathname } = React.useMemo(() => {
    const overrides = [
      {
        label: 'Definitions',
        linkTo: '/alerts/definitions',
        position: 1,
      },
      {
        label: 'Details',
        linkTo: `/alerts/definitions/details/${serviceType}/${alertId}`,
        position: 2,
      },
    ];
    return { crumbOverrides: overrides, pathname: '/Definitions/Details' };
  }, [alertId, serviceType]);

  const theme = useTheme();
  const nonSuccessBoxHeight = '600px';
  const sectionMaxHeight = '785px';

  if (isLoading) {
    return (
      <>
        <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
        <Box alignContent="center" height={nonSuccessBoxHeight}>
          <CircleProgress />
        </Box>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
        <Box alignContent="center" height={nonSuccessBoxHeight}>
          <ErrorState errorText="An error occurred while loading the definitions. Please try again later." />
        </Box>
      </>
    );
  }

  if (!alertDetails) {
    return (
      <>
        <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />
        <Box alignContent="center" height={nonSuccessBoxHeight}>
          <StyledPlaceholder
            icon={AlertsIcon}
            isEntity
            title="No data to display."
          />
        </Box>
      </>
    );
  }
  const {
    class: alertClass,
    entity_ids: entityIds,
    service_type: alertServiceType,
    type,
    status,
    label,
  } = alertDetails;

  return (
    <>
      <DocumentTitleSegment segment={`${alertDetails.label}`} />
      <Stack spacing={2}>
        <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathname} />

        {status === 'failed' && (
          <Notice variant="error">
            <Typography
              sx={(theme) => ({
                font: theme.font.bold,
                fontSize: theme.spacingFunction(16),
              })}
            >
              {label} alert creation has failed. Please{' '}
              <Link
                href="https://cloud.linode.com/support/tickets"
                underline="hover"
              >
                contact support
              </Link>{' '}
              to resolve the issue.
            </Typography>
          </Notice>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <Box
            display="flex"
            flexDirection={{ md: 'row', xs: 'column' }}
            gap={2}
          >
            <Box
              data-qa-section="Overview"
              flexBasis="50%"
              maxHeight={sectionMaxHeight}
              sx={{ ...getAlertBoxStyles(theme), overflow: 'auto' }}
            >
              <AlertDetailOverview alertDetails={alertDetails} />
            </Box>
            <Box
              data-qa-section="Criteria"
              flexBasis="50%"
              maxHeight={sectionMaxHeight}
              sx={{
                ...getAlertBoxStyles(theme),
                overflow: 'auto',
              }}
            >
              <AlertDetailCriteria alertDetails={alertDetails} />
            </Box>
          </Box>
          <Box
            data-qa-section="Resources"
            maxHeight={sectionMaxHeight}
            sx={{
              ...getAlertBoxStyles(theme),
              overflow: 'auto',
            }}
          >
            <AlertResources
              alertClass={alertClass}
              alertResourceIds={entityIds}
              alertType={type}
              serviceType={alertServiceType}
            />
          </Box>
          <Box
            data-qa-section="Notification Channels"
            sx={{
              ...getAlertBoxStyles(theme),
              overflow: 'auto',
            }}
          >
            <AlertDetailNotification
              channelIds={alertDetails.alert_channels.map(({ id }) => id)}
            />
          </Box>
        </Box>
      </Stack>
    </>
  );
};

export const StyledPlaceholder = styled(Placeholder, {
  label: 'StyledPlaceholder',
})(({ theme }) => ({
  h1: {
    fontSize: theme.spacing(2),
  },
  padding: 0,
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
    color: theme.tokens.alias.Content.Text.Primary.Default,
    marginRight: theme.spacing(1),
  },
  backgroundColor: theme.tokens.alias.Background.Normal,
  borderRadius: borderRadius || 0,
  height: theme.spacing(3),
}));

export const StyledAlertTypography = styled(Typography, {
  label: 'StyledAlertTypography',
})(({ theme }) => ({
  color: theme.tokens.alias.Content.Text.Primary.Default,
  fontSize: theme.typography.body1.fontSize,
}));
