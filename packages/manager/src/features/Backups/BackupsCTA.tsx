import { IconButton, Notice, Typography } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import React from 'react';

import { LinkButton } from 'src/components/LinkButton';
import { useAccountSettings } from 'src/queries/account/settings';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';
import { useProfile } from 'src/queries/profile/profile';

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
      <Typography fontSize="inherit">
        <LinkButton onClick={() => setIsBackupsDrawerOpen(true)}>
          Enable Linode Backups
        </LinkButton>{' '}
        to protect your data and recover quickly in an emergency.
      </Typography>
      <IconButton
        aria-label="Dismiss notice enabling Linode backups"
        onClick={handleDismiss}
        sx={{ padding: 1 }}
      >
        <Close />
      </IconButton>
      <BackupDrawer
        onClose={() => setIsBackupsDrawerOpen(false)}
        open={isBackupsDrawerOpen}
      />
    </Notice>
  );
};
