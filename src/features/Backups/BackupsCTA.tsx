import { compose, isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { handleOpen } from 'src/store/reducers/backupDrawer';
import { MapState } from 'src/store/types';

type ClassNames = 'root'
  | 'button';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    margin: `${theme.spacing.unit}px ${theme.spacing.unit}px ${theme.spacing.unit * 3}px 0`,
    [theme.breakpoints.down('md')]: {
      marginTop: -theme.spacing.unit,
      width: '100%',
    },
  },
  button: {
    marginTop: theme.spacing.unit,
  }
});


type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

const BackupsCTA: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linodesWithoutBackups, managed, actions: { openBackupsDrawer }  } = props;

  if (managed || (linodesWithoutBackups && isEmpty(linodesWithoutBackups))) { return null; }

  return (
    <Paper className={classes.root} >
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h2">
            Back Up Your Data
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            We've got your back! Enable now to protect all existing Linodes.
          </Typography>
        </Grid>
        <Grid item>
          <Button data-qa-backup-existing type="primary" className={classes.button} onClick={openBackupsDrawer}>Enable Now</Button>
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
  }
}

const mapStateToProps: MapState<StateProps, {}> = (state, ownProps) => ({
  linodesWithoutBackups: state.__resources.linodes.entities.filter(l => !l.backups.enabled),
  managed: pathOr(false, ['__resources','accountSettings','data','managed'], state)
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      openBackupsDrawer: () => dispatch(handleOpen()),
    }
  };
};


const styled = withStyles(styles);

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced: any = compose(
  styled,
  connected
)(BackupsCTA)

export default enhanced;
