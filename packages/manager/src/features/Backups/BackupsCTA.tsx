import { Linode } from '@linode/api-v4/lib/linodes';
import Close from '@mui/icons-material/Close';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import { StyledPaper } from './BackupsCTA.styles';
import { Typography } from 'src/components/Typography';
import { StyledIconButton } from './BackupsCTA.styles';
import { Box } from 'src/components/Box';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import { useAccountSettings } from 'src/queries/accountSettings';
import { handleOpen } from 'src/store/backupDrawer';

import { getLinodesWithoutBackups } from 'src/store/selectors/getLinodesWithBackups';
import { MapState } from 'src/store/types';
import { useProfile } from 'src/queries/profile';

import type { PreferenceToggleProps } from 'src/components/PreferenceToggle/PreferenceToggle';

type BackupsCTAProps = StateProps & DispatchProps;

const BackupsCTA = (props: BackupsCTAProps) => {
  const {
    linodesWithoutBackups,
    actions: { openBackupsDrawer },
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
      preferenceKey="backups_cta_dismissed"
      preferenceOptions={[false, true]}
      localStorageKey="BackupsCtaDismissed"
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
              <StyledIconButton onClick={dismissed}>
                <Close />
              </StyledIconButton>
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
