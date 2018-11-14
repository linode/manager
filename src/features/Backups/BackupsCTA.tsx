import { compose, isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import { handleOpen } from 'src/store/reducers/backupDrawer';


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
          <Typography variant="title">
            Back Up Your Data
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            We've got your back! Enable now to protect all existing Linodes.
          </Typography>
        </Grid>
        <Grid item>
          <Button type="primary" className={classes.button} onClick={openBackupsDrawer}>Enable Now</Button>
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

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  linodesWithoutBackups: pathOr([],['backups','data'], state),
  managed: pathOr(false, ['__resources','accountSettings','data','managed'], state)
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      openBackupsDrawer: () => dispatch(handleOpen()),
    }
  };
};


const styled = withStyles(styles, { withTheme: true });

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced: any = compose(
  styled,
  connected
)(BackupsCTA)

export default enhanced;
