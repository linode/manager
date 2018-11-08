import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Button from 'src/components/Button';
import Grid from 'src/components/Grid';

type ClassNames = 'root' | 'button';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    margin: `${theme.spacing.unit}px ${theme.spacing.unit}px ${theme.spacing.unit * 3}px 0`,
  },
  button: {
    marginTop: theme.spacing.unit,
  }
});

interface Props {
  onSubmit: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const BackupsCTA: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, onSubmit } = props;
  return (
    <Paper className={classes.root} >
      <Grid container>
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
          <Button type="primary" className={classes.button} onClick={onSubmit}>Enable Now</Button>
        </Grid>
      </Grid>

    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(BackupsCTA);
