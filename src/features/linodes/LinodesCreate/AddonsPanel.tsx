import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';

import CheckBox from '../../../components/CheckBox';

type ClassNames = 'root' | 'flex' | 'dFlex' | 'option' | 'inner' | 'panelBody';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 2,
    backgroundColor: theme.palette.background.paper,
  },
  flex: {
    flex: 1,
  },
  dFlex: {
    display: 'flex',
  },
  option: {
    marginTop: theme.spacing.unit * 3,
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
    (e: React.ChangeEvent<Linode.TodoAny>, value: any) =>
      void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class AddonsPanel extends React.Component<CombinedProps> {
  render() {
    const { classes, handleChange } = this.props;
    const setBackups = handleChange('backups');
    const setPrivateIP = handleChange('privateIP');

    return (
      <Paper className={classes.root}>
        <div className={classes.inner}>
          <Typography variant="title">Optional Add-ons</Typography>
          <Grid container className={classes.option}>
            <Grid item>
              <CheckBox
                checked={this.props.backups}
                onClick={e => setBackups(e, !this.props.backups)}
              />
            </Grid>
            <Grid item className={classes.flex}>
              <Grid container>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item alignItems={'flex-end'}>
                    <Typography variant="subheading">
                      Backups
                    </Typography>
                    </Grid>
                    <Grid item alignItems={'flex-end'} className={classes.dFlex}>
                      <Typography variant="caption">
                        $2.50 per month
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} className="py0">
                  <Typography variant="caption">
                    Three backup slots are executed and rotated automatically: a daily backup, a 2-7
                    day old backup, and an 8-14 day old backup. Plans are priced according to you
                    Linode plan selected above.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container className={classes.option} style={{ marginBottom: 8 }}>
            <Grid item>
              <CheckBox
                checked={this.props.privateIP}
                onClick={e => setPrivateIP(e, !this.props.privateIP)}
              />
            </Grid>
            <Grid item className={classes.flex}>
              <Grid container>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={12}>
                    <Typography variant="subheading">
                      Private IP (Free!)
                    </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} className="py0">
                  <Typography variant="caption">
                  We need copy! We need copy! We need copy! We need copy! We need copy! We need
                  copy! We need copy! We need copy! We need copy! We need copy! We need copy! We
                  need copy!
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
