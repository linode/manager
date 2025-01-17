import { Typography } from '@linode/ui';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { LinkButton } from 'src/components/LinkButton';
import { useAccountSettings } from 'src/queries/account/settings';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useProfile } from 'src/queries/profile/profile';

import { BackupDrawer } from './BackupDrawer';

export const BackupsCTA = () => {
  const { data: accountSettings } = useAccountSettings();
  const { data: profile } = useProfile();

  const [isBackupsDrawerOpen, setIsBackupsDrawerOpen] = React.useState(false);

  const { data: linodes } = useAllLinodesQuery();

  const areAllLinodesBackedUp = !linodes?.some(
    (linode) => !linode.backups.enabled
  );

  if (
    profile?.restricted ||
    accountSettings?.managed ||
    areAllLinodesBackedUp
  ) {
    return null;
  }

  return (
    <DismissibleBanner
      bgcolor={(theme) => theme.palette.background.paper}
      preferenceKey="backups-cta"
      spacingBottom={8}
      variant="info"
    >
      <Typography fontSize="inherit">
        <LinkButton onClick={() => setIsBackupsDrawerOpen(true)}>
          Enable Linode Backups
        </LinkButton>{' '}
        to protect your data and recover quickly in an emergency.
      </Typography>
      <BackupDrawer
        onClose={() => setIsBackupsDrawerOpen(false)}
        open={isBackupsDrawerOpen}
      />
    </DismissibleBanner>
  );
};
