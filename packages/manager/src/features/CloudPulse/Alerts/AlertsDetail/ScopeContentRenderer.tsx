import { Box, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';

import NullComponent from 'src/components/NullComponent';
import { useAllEntitiesByAlertIdQuery } from 'src/queries/cloudpulse/alerts';

import { AlertRegions } from '../AlertRegions/AlertRegions';
import { AlertResources } from '../AlertsResources/AlertsResources';
import { ACCOUNT_GROUP_INFO_MESSAGE } from '../constants';
import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import { getAlertBoxStyles } from '../Utils/utils';

import type { Alert } from '@linode/api-v4';

interface ScopeContentRendererProps {
  alert: Alert;
  maxHeight: string;
}

export const ScopeContentRenderer = (props: ScopeContentRendererProps) => {
  const {
    maxHeight,
    alert: {
      class: alertClass,
      id: alertId,
      regions,
      type,
      scope,
      service_type: serviceType,
    },
  } = props;
  const theme = useTheme();

  // Fetch entities using the new API when scope is 'entity'
  const {
    data: entities,
    isLoading: isEntitiesLoading,
    isError: isEntitiesError,
  } = useAllEntitiesByAlertIdQuery(
    serviceType,
    String(alertId),
    undefined,
    undefined,
    scope === 'entity'
  );

  const entityIds = React.useMemo(
    () => entities?.map((entity) => entity.id) ?? [],
    [entities]
  );

  return (
    <Box
      data-qa-section="Resources"
      maxHeight={maxHeight}
      sx={{
        ...getAlertBoxStyles(theme),
        overflow: 'auto',
      }}
    >
      {(() => {
        switch (scope) {
          case 'account':
            return (
              <Stack gap={2}>
                <Typography variant="h2">Account</Typography>
                <AlertListNoticeMessages
                  errorMessage={ACCOUNT_GROUP_INFO_MESSAGE}
                  title="Account"
                  variant="info"
                />
              </Stack>
            );

          case 'entity':
            return (
              <AlertResources
                alertClass={alertClass}
                alertResourceIds={entityIds}
                alertType={type}
                isEntitiesError={isEntitiesError}
                isEntitiesLoading={isEntitiesLoading}
                serviceType={serviceType}
              />
            );

          case 'region':
            return (
              <AlertRegions
                mode="view"
                serviceType={serviceType}
                value={regions}
              />
            );
          default:
            return <NullComponent />;
        }
      })()}
    </Box>
  );
};
