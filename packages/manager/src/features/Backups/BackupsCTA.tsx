import { Linode } from '@linode/api-v4/lib/linodes';
import Close from '@mui/icons-material/Close';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { compose } from 'recompose';

import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';
import { useAccountSettings } from 'src/queries/accountSettings';
import { useProfile } from 'src/queries/profile';
import { handleOpen } from 'src/store/backupDrawer';
import { getLinodesWithoutBackups } from 'src/store/selectors/getLinodesWithBackups';
import { MapState } from 'src/store/types';

import type { PreferenceToggleProps } from 'src/components/PreferenceToggle/PreferenceToggle';

const useStyles = makeStyles((theme: Theme) => ({
  closeIcon: {
    ...theme.applyLinkStyles,
    lineHeight: '0.5rem',
    marginLeft: 12,
  },
  enableButton: {
    height: 40,
    padding: 0,
    width: 152,
  },
  enableText: {
    ...theme.applyLinkStyles,
  },
  root: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    margin: `${theme.spacing(1)} 0 ${theme.spacing(3)} 0`,
    padding: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
}));

type CombinedProps = StateProps & DispatchProps;

const BackupsCTA: React.FC<CombinedProps> = (props) => {
  const {
    actions: { openBackupsDrawer },
    linodesWithoutBackups,
  } = props;
  const classes = useStyles();

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
          <Paper className={classes.root}>
            <Typography style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>
              <button
                className={classes.enableText}
                onClick={openBackupsDrawer}
              >
                Enable Linode Backups
              </button>{' '}
              to protect your data and recover quickly in an emergency.
            </Typography>
            <span style={{ display: 'flex' }}>
              <button className={classes.closeIcon} onClick={dismissed}>
                <Close />
              </button>
            </span>
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

const enhanced = compose<CombinedProps, {}>(connected)(BackupsCTA);

export default enhanced;
