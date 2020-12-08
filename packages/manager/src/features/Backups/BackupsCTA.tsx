import { Linode } from '@linode/api-v4/lib/linodes';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import { handleOpen } from 'src/store/backupDrawer';
import { getLinodesWithoutBackups } from 'src/store/selectors/getLinodesWithBackups';
import { MapState } from 'src/store/types';

type ClassNames = 'root' | 'container' | 'buttonsContainer' | 'dismiss';

interface Props {
  dismissed: () => void;
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      margin: `${theme.spacing(1)}px 0 ${theme.spacing(3)}px 0`,
      [theme.breakpoints.down('md')]: {
        marginTop: -theme.spacing(1),
        width: '100%'
      }
    },
    container: {
      [theme.breakpoints.down('md')]: {
        alignItems: 'center'
      }
    },
    buttonsContainer: {
      marginTop: theme.spacing(1)
    },
    dismiss: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      minWidth: 'auto',
      marginTop: 10
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
      <Grid container direction="column" className={classes.container}>
        <Grid item>
          <Typography variant="h2">Back Up Your Data</Typography>
        </Grid>
        <Grid item>
          <Typography>
            We&#39;ve got your back! Click below to enable Backups for all
            Linodes, and be sure to read our guide on Backups{` `}
            <a
              target="_blank"
              aria-describedby="external-site"
              rel="noopener noreferrer"
              href={
                'https://www.linode.com/docs/platform' +
                '/disk-images/linode-backup-service/'
              }
            >
              features and limitations.
            </a>
          </Typography>
        </Grid>
        <Grid item className={classes.buttonsContainer}>
          <Button
            data-qa-backup-existing
            buttonType="primary"
            onClick={openBackupsDrawer}
          >
            Enable Now
          </Button>
          <Button
            data-qa-backup-existing
            buttonType="secondary"
            className={classes.dismiss}
            onClick={dismissed}
          >
            Dismiss
          </Button>
        </Grid>
      </Grid>
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
