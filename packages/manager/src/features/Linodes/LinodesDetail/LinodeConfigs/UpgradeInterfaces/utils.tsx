import { List, ListItem, Stack, Typography } from '@linode/ui';
import React from 'react';

import type { CannotUpgradeInterfaceReasons } from 'src/hooks/useCanUpgradeInterfaces';

const UPGRADE_REASON_TO_COPY: Record<CannotUpgradeInterfaceReasons, string> = {
  isLegacyConfigOnlyAccount:
    'Linode Interfaces are not enabled in your account settings.',
  isLkeLinode:
    'Linode Interfaces are not available for LKE Cluster Linodes yet.',
  regionUnsupported: 'Linode Interfaces are not available in this region yet.',
};

export const getUnableToUpgradeTooltipText = (
  reasons: CannotUpgradeInterfaceReasons[]
) => {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <Stack>
      {reasons.length === 1 ? (
        <Typography>{UPGRADE_REASON_TO_COPY[reasons[0]]}</Typography>
      ) : (
        <>
          <Typography>Cannot upgrade interfaces:</Typography>
          <List sx={{ listStyleType: 'disc', pl: 3 }}>
            {reasons.map((entity) => (
              <ListItem
                disablePadding
                key={entity}
                sx={{ display: 'list-item' }}
              >
                {UPGRADE_REASON_TO_COPY[entity]}
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Stack>
  );
};
