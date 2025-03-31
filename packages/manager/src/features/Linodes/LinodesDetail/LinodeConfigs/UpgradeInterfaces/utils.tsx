import { List, ListItem, Stack, Typography } from '@linode/ui';
import React from 'react';

export const getUnableToUpgradeTooltipText = (reasons: {
  isLegacyConfigOnlyAccount: boolean;
  isLkeLinode: boolean;
  isRegionUnsupported: boolean;
}) => {
  const {
    isLegacyConfigOnlyAccount,
    isLkeLinode,
    isRegionUnsupported,
  } = reasons;

  if (!isLegacyConfigOnlyAccount && !isLkeLinode && !isRegionUnsupported) {
    return null;
  }

  return (
    <Stack>
      <Typography>Unable to upgrade:</Typography>
      <List sx={{ listStyleType: 'disc', pl: 3 }}>
        {isLkeLinode && (
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            This Linode belongs to an LKE cluster.
          </ListItem>
        )}
        {isLegacyConfigOnlyAccount && (
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Your account does not support upgrading to Linode interfaces.
          </ListItem>
        )}
        {isRegionUnsupported && (
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Your Linode&#39;s region does not support Linode interfaces.
          </ListItem>
        )}
      </List>
    </Stack>
  );
};
