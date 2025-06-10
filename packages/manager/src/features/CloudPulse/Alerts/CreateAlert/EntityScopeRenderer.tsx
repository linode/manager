import { Box, Typography } from '@linode/ui';
import React from 'react';

import { ACCOUNT_GROUP_INFO_MESSAGE } from '../constants';
import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import { getAlertBoxStyles } from '../Utils/utils';
import { CloudPulseModifyAlertRegions } from './Regions/CloudPulseModifyAlertRegions';
import { CloudPulseModifyAlertResources } from './Resources/CloudPulseModifyAlertResources';

import type { AlertDefinitionGroup } from '@linode/api-v4';

export interface EntityScopeRendererProps {
  scope: AlertDefinitionGroup | null;
}

export const EntityScopeRenderer = (props: EntityScopeRendererProps) => {
  const { scope } = props;

  return (
    <>
      {(() => {
        switch (scope) {
          case 'account':
            return <AccountGroupingNotice />;
          case 'entity':
            return <CloudPulseModifyAlertResources name="entity_ids" />;
          case 'region':
            return <CloudPulseModifyAlertRegions name="regions" />;
          default:
            return <NoScopeSelectedMessaege />;
        }
      })()}
    </>
  );
};

const AccountGroupingNotice = () => {
  return (
    <Box display="flex" flexDirection="column" gap={3} paddingTop={3}>
      <Typography variant="h2">2. Account</Typography>
      <Box
        sx={(theme) => ({
          ...getAlertBoxStyles(theme),
          overflow: 'auto',
        })}
      >
        <AlertListNoticeMessages
          errorMessage={ACCOUNT_GROUP_INFO_MESSAGE}
          variant="info"
        />
      </Box>
    </Box>
  );
};

const NoScopeSelectedMessaege = () => {
  return (
    <Box display="flex" flexDirection="column" gap={3} paddingTop={3}>
      <Typography variant="h2">2. Account/Region/Entity</Typography>
      <Box
        sx={(theme) => ({
          ...getAlertBoxStyles(theme),
          overflow: 'auto',
        })}
      >
        <Typography>No scope selected</Typography>
      </Box>
    </Box>
  );
};
