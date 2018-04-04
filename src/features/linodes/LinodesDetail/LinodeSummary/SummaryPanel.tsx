import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Hidden from 'material-ui/Hidden';

type ClassNames = 'root' | 'text';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2,
  },
  text: {
    marginTop: theme.spacing.unit,
  },
});

interface Props {
  linode: Linode.Linode;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SummaryPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes } = props;

  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subheading">
            Summary
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Typography className={classes.text} variant="body1">
            Ubuntu 14.04 LTS, Debian 9
          </Typography>
          <Typography className={classes.text} variant="body1">
            Linode 1G 1 CPU(s), 20G Storage, 1G Ram
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Typography className={classes.text} variant="body1">
            172.104.16.235
          </Typography>
          <Typography className={classes.text} variant="body1">
            2600:3c03::f03c:91ff:fe86:d82c
          </Typography>
        </Grid>
        <Hidden lgUp>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.text} variant="body1">
              US East
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.text} variant="body1">
              Volumes: 2
            </Typography>
          </Grid>
        </Hidden>
        <Hidden mdDown>
          <Grid item xs={12} sm={6} lg={4}>
            <Typography className={classes.text} variant="body1">
              US East
            </Typography>
            <Typography className={classes.text} variant="body1">
              Volumes: 2
            </Typography>
          </Grid>
        </Hidden>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SummaryPanel);
