import { Linode } from '@linode/api-v4/lib/linodes';
import Close from '@material-ui/icons/Close';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import { handleOpen } from 'src/store/backupDrawer';
import { getLinodesWithoutBackups } from 'src/store/selectors/getLinodesWithBackups';
import { MapState } from 'src/store/types';

type ClassNames = 'root' | 'enableButton' | 'enableText' | 'closeIcon';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1),
      paddingRight: theme.spacing(2),
      margin: `${theme.spacing(1)}px 0 ${theme.spacing(3)}px 0`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    enableButton: {
      height: 40,
      padding: 0,
      width: 152
    },
    enableText: {
      ...theme.applyLinkStyles
    },
    closeIcon: {
      ...theme.applyLinkStyles,
      marginLeft: 12
    }
  });

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

const BackupsCTA: React.FC<CombinedProps> = props => {
  const {
    classes,
    linodesWithoutBackups,
    managed,
    actions: { openBackupsDrawer }
  } = props;

  const restricted = isRestrictedUser();

  if (
    restricted ||
    managed ||
    (linodesWithoutBackups && isEmpty(linodesWithoutBackups))
  ) {
    return null;
  }

  return (
    <PreferenceToggle<boolean>
      preferenceKey="backups_cta_dismissed"
      preferenceOptions={[true, false]}
      localStorageKey="BackupsCtaDismissed"
    >
      {({
        preference: isDismissed,
        togglePreference: dismissed
      }: ToggleProps<boolean>) => {
        return isDismissed ? (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <React.Fragment />
        ) : (
          <Paper className={classes.root}>
            <Typography style={{ fontSize: '1rem' }}>
              <button
                className={classes.enableText}
                onClick={openBackupsDrawer}
              >
                Enable Linode Backups
              </button>{' '}
              to protect your data and recover quickly in an emergency.
            </Typography>
            <span style={{ display: 'flex' }}>
              <button onClick={dismissed} className={classes.closeIcon}>
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
  managed: boolean;
}

interface DispatchProps {
  actions: {
    openBackupsDrawer: () => void;
  };
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  linodesWithoutBackups: getLinodesWithoutBackups(state.__resources),
  managed: state?.__resources?.accountSettings?.data?.managed ?? false
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => {
  return {
    actions: {
      openBackupsDrawer: () => dispatch(handleOpen())
    }
  };
};

const styled = withStyles(styles);

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(styled, connected)(BackupsCTA);

export default enhanced;
