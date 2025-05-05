import {
  useAccountSettings,
  useAllLinodesQuery,
  useMutatePreferences,
  usePreferences,
  useProfile,
} from '@linode/queries';
import {
  Box,
  CloseIcon,
  IconButton,
  LinkButton,
  Notice,
  Typography,
} from '@linode/ui';
import React from 'react';

import { BackupDrawer } from './BackupDrawer';

export const BackupsCTA = () => {
  const { data: accountSettings } = useAccountSettings();
  const { data: profile } = useProfile();

  const { data: isBackupsBannerDismissed } = usePreferences(
    (preferences) => preferences?.backups_cta_dismissed
  );
  const { mutate: updatePreferences } = useMutatePreferences();

  const [isBackupsDrawerOpen, setIsBackupsDrawerOpen] = React.useState(false);

  const handleDismiss = () => {
    updatePreferences({ backups_cta_dismissed: true });
  };

  const { data: linodes } = useAllLinodesQuery();

  const areAllLinodesBackedUp = !linodes?.some(
    (linode) => !linode.backups.enabled
  );

  if (
    profile?.restricted ||
    accountSettings?.managed ||
    areAllLinodesBackedUp ||
    isBackupsBannerDismissed
  ) {
    return null;
  }

  return (
    <Notice
      bgcolor={(theme) => theme.palette.background.paper}
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      spacingBottom={8}
      variant="info"
    >
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        width="100%"
      >
        <Typography fontSize="inherit" sx={{ flex: 1 }}>
          <LinkButton onClick={() => setIsBackupsDrawerOpen(true)}>
            Enable Linode Backups
          </LinkButton>{' '}
          to protect your data and recover quickly in an emergency.
        </Typography>
        <IconButton
          aria-label="Dismiss notice enabling Linode backups"
          onClick={handleDismiss}
          sx={(theme) => ({
            padding: 0.25,
            '& path': {
              fill: theme.tokens.component.NotificationBanner.Icon,
            },
          })}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <BackupDrawer
        onClose={() => setIsBackupsDrawerOpen(false)}
        open={isBackupsDrawerOpen}
      />
    </Notice>
  );
};
