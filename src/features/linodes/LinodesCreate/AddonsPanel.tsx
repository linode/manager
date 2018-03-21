import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';

type ClassNames = 'root' | 'inner' | 'panelBody';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.palette.background.paper,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  panelBody: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit}px`,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  backups: boolean;
  privateIP: boolean;
  handleChange: (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>, value: any) =>
      void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class AddonsPanel extends React.Component<CombinedProps> {
  render() {
    const { classes, handleChange } = this.props;
    return (
      <Paper className={classes.root}>
      <div className={classes.inner}>
        <Typography component="div" variant="title">Optional Add-ons</Typography>
        <Grid container>
          <Grid xs={1}item>
            <input
              type="checkbox"
              onChange={e => handleChange('backups')(e, !this.props.backups)}
            />
          </Grid>
          <Grid xs={11}item>
            <Grid container>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={1}>
                  <Typography variant="title">
                    Backups
                  </Typography>
                  </Grid>
                  <Grid item xs={11}>
                    <Typography variant="caption">
                      $2.50 per month
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  Three backup slots are executed and rotated automatically: a daily backup, a 2-7
                  day old backup, and an 8-14 day old backup. Plans are priced according to you
                  Linode plan selected above.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container>
          <Grid xs={1}item>
            <input
              type="checkbox"
              onChange={e => handleChange('privateIP')(e, !this.props.backups)}
            />
          </Grid>
          <Grid xs={11}item>
            <Grid container>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12}>
                  <Typography variant="title">
                    Private IP (Free!)
                  </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                We need copy! We need copy! We need copy! We need copy! We need copy! We need copy!
                We need copy! We need copy! We need copy! We need copy! We need copy! We need copy!
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </Paper>
    );
  }
}

export default styled<Props>(AddonsPanel);
