import { WithStyles } from '@material-ui/core/styles';
import { compose, isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { handleOpen } from 'src/store/backupDrawer';
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
      minWidth: 'auto'
    }
  });

type CombinedProps = StateProps &
  Props &
  DispatchProps &
  WithStyles<ClassNames>;

const BackupsCTA: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    linodesWithoutBackups,
    managed,
    actions: { openBackupsDrawer },
    dismissed
  } = props;

  if (managed || (linodesWithoutBackups && isEmpty(linodesWithoutBackups))) {
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
            We've got your back! Click below to enable Backups for all Linodes,
            and be sure to read our guide on Backups{` `}
            <a
              target="_blank"
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
            variant="text"
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
  linodesWithoutBackups: Linode.Linode[];
  managed: boolean;
}

interface DispatchProps {
  actions: {
    openBackupsDrawer: () => void;
  };
}

const mapStateToProps: MapState<StateProps, {}> = (state, ownProps) => ({
  linodesWithoutBackups: state.__resources.linodes.entities.filter(
    l => !l.backups.enabled
  ),
  managed: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'managed'],
    state
  )
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch,
  ownProps
) => {
  return {
    actions: {
      openBackupsDrawer: () => dispatch(handleOpen())
    }
  };
};

const styled = withStyles(styles);

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced: any = compose(
  styled,
  connected
)(BackupsCTA);

export default enhanced;
