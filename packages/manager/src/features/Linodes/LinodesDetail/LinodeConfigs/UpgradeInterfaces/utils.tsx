import { List, ListItem, Stack, Typography } from '@linode/ui';
import React from 'react';

import type { CannotUpgradeInterfaceReasons } from 'src/hooks/useCanUpgradeInterfaces';

const UPGRADE_REASON_TO_COPY: Record<CannotUpgradeInterfaceReasons, string> = {
  isLegacyConfigOnlyAccount:
    'Your account does not support upgrading to Linode interfaces.',
  isLkeLinode: 'This Linode belongs to an LKE cluster.',
  regionUnsupported: "Your Linode's region does not support Linode interfaces.",
};

export const getUnableToUpgradeTooltipText = (
  reasons: CannotUpgradeInterfaceReasons[]
) => {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <Stack>
      <Typography>Cannot upgrade interfaces:</Typography>
      <List sx={{ listStyleType: 'disc', pl: 3 }}>
        {reasons.map((entity) => (
          <ListItem disablePadding key={entity} sx={{ display: 'list-item' }}>
            {UPGRADE_REASON_TO_COPY[entity]}
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};
