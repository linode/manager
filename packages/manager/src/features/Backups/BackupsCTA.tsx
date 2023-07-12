import { Linode } from '@linode/api-v4/lib/linodes';
import Close from '@mui/icons-material/Close';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { IconButton } from 'src/components/IconButton';
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
          <Paper
            sx={(theme: Theme) => ({
              padding: theme.spacing(1),
              paddingRight: theme.spacing(2),
              marginTop: theme.spacing(1),
              marginBottom: theme.spacing(3),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            })}
          >
            <Typography sx={{ fontSize: '1rem', marginLeft: '0.5rem' }}>
              <StyledLinkButton
                sx={(theme: Theme) => ({
                  ...theme.applyLinkStyles,
                })}
                onClick={openBackupsDrawer}
              >
                Enable Linode Backups
              </StyledLinkButton>{' '}
              to protect your data and recover quickly in an emergency.
            </Typography>
            <Box component="span" sx={{ display: 'flex' }}>
              <IconButton
                sx={(theme: Theme) => ({
                  ...theme.applyLinkStyles,
                  marginLeft: 12,
                  lineHeight: '0.5rem',
                })}
                onClick={dismissed}
              >
                <Close />
              </IconButton>
            </Box>
          </Paper>
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

const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  linodesWithoutBackups: getLinodesWithoutBackups(state.__resources),
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch
) => {
  return {
    actions: {
      openBackupsDrawer: () => dispatch(handleOpen()),
    },
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<BackupsCTAProps, {}>(connected)(BackupsCTA);

export default enhanced;
