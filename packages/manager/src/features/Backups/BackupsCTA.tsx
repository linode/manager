import { Linode } from '@linode/api-v4/lib/linodes';
import Close from '@mui/icons-material/Close';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { compose } from 'recompose';

import { Box } from 'src/components/Box';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import { Typography } from 'src/components/Typography';
import { useAccountSettings } from 'src/queries/accountSettings';
import { useProfile } from 'src/queries/profile';
import { handleOpen } from 'src/store/backupDrawer';

import { StyledPaper } from './BackupsCTA.styles';

import type { PreferenceToggleProps } from 'src/components/PreferenceToggle/PreferenceToggle';

type BackupsCTAProps = StateProps & DispatchProps;

const BackupsCTA = (props: BackupsCTAProps) => {
  const {
    actions: { openBackupsDrawer },
    linodesWithoutBackups,
  } = props;

  const { data: accountSettings } = useAccountSettings();
  const { data: profile } = useProfile();

  if (
    profile?.restricted ||
    accountSettings?.managed ||
    (linodesWithoutBackups && isEmpty(linodesWithoutBackups))
  ) {
    return null;
  }

  return (
    <PreferenceToggle<boolean>
      localStorageKey="BackupsCtaDismissed"
      preferenceKey="backups_cta_dismissed"
      preferenceOptions={[false, true]}
    >
      {({
        preference: isDismissed,
        togglePreference: dismissed,
      }: PreferenceToggleProps<boolean>) => {
        return isDismissed ? (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <React.Fragment />
        ) : (
          <StyledPaper>
            <Typography sx={{ fontSize: '1rem', marginLeft: '0.5rem' }}>
              <StyledLinkButton onClick={openBackupsDrawer}>
                Enable Linode Backups
              </StyledLinkButton>{' '}
              to protect your data and recover quickly in an emergency.
            </Typography>
            <Box component="span" sx={{ display: 'flex' }}>
              <StyledLinkButton
                onClick={dismissed}
                sx={{ lineHeight: '0.5rem', marginLeft: 12 }}
              >
                <Close />
              </StyledLinkButton>
            </Box>
          </StyledPaper>
        );
      }}
    </PreferenceToggle>
  );
};

interface StateProps {
  linodesWithoutBackups: Linode[];
}

interface DispatchProps {
  actions: {
    openBackupsDrawer: () => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch
) => {
  return {
    actions: {
      openBackupsDrawer: () => dispatch(handleOpen()),
    },
  };
};

const connected = connect(undefined, mapDispatchToProps);

const enhanced = compose<BackupsCTAProps, {}>(connected)(BackupsCTA);

export { enhanced as BackupsCTA };
