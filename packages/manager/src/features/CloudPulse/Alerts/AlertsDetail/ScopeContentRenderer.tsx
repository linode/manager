import { Box, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';

import NullComponent from 'src/components/NullComponent';

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
      entity_ids: entityIds,
      regions,
      type,
      scope,
      service_type: serviceType,
    },
  } = props;
  const theme = useTheme();

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
