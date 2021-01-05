import { Linode } from '@linode/api-v4/lib/linodes';
import Close from '@material-ui/icons/Close';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import { handleOpen } from 'src/store/backupDrawer';
import { getLinodesWithoutBackups } from 'src/store/selectors/getLinodesWithBackups';
import { MapState } from 'src/store/types';

type ClassNames = 'root' | 'enableButton' | 'enableText' | 'closeIcon';

interface Props {
  dismissed: () => void;
}

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

type CombinedProps = StateProps &
  Props &
  DispatchProps &
  WithStyles<ClassNames>;

const BackupsCTA: React.FC<CombinedProps> = props => {
  const {
    classes,
    linodesWithoutBackups,
    managed,
    actions: { openBackupsDrawer },
    dismissed
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
    <Paper className={classes.root}>
      <Typography style={{ fontSize: '1rem' }}>
        <button className={classes.enableText} onClick={openBackupsDrawer}>
          Enable Linode Backups
        </button>{' '}
        to protect your data and recover quickly in an emergency.
      </Typography>
      <span style={{ display: 'flex' }}>
        <Hidden smDown>
          <Button
            buttonType="primary"
            onClick={openBackupsDrawer}
            className={classes.enableButton}
          >
            Enable Backups
          </Button>
        </Hidden>
        <button onClick={dismissed} className={classes.closeIcon}>
          <Close />
        </button>
      </span>
    </Paper>
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

const enhanced = compose<CombinedProps, Props>(styled, connected)(BackupsCTA);

export default enhanced;
