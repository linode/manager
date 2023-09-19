import Close from '@mui/icons-material/Close';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { Typography } from 'src/components/Typography';
import { useAccountSettings } from 'src/queries/accountSettings';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';
import { useProfile } from 'src/queries/profile';

import { BackupDrawer } from './BackupDrawer';
import { StyledPaper } from './BackupsCTA.styles';

export const BackupsCTA = () => {
  const { data: accountSettings } = useAccountSettings();
  const { data: profile } = useProfile();

  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

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
    preferences?.backups_cta_dismissed
  ) {
    return null;
  }

  return (
    <StyledPaper>
      <Typography sx={{ fontSize: '1rem', marginLeft: '0.5rem' }}>
        <StyledLinkButton onClick={() => setIsBackupsDrawerOpen(true)}>
          Enable Linode Backups
        </StyledLinkButton>{' '}
        to protect your data and recover quickly in an emergency.
      </Typography>
      <Box component="span" display="flex">
        <StyledLinkButton
          aria-label="Dismiss notice enabling Linode backups"
          onClick={handleDismiss}
          sx={{ lineHeight: '0.5rem', marginLeft: 12 }}
        >
          <Close />
        </StyledLinkButton>
      </Box>
      <BackupDrawer
        onClose={() => setIsBackupsDrawerOpen(false)}
        open={isBackupsDrawerOpen}
      />
    </StyledPaper>
  );
};
