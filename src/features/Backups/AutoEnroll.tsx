import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';

type ClassNames = 'root' | 'header';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.offWhite,
    padding: theme.spacing.unit,
  },
  header: {
    marginBottom: theme.spacing.unit,
    fontSize: 17
  },
});

interface Props {
  enabled: boolean;
  toggle: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const AutoEnroll: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, enabled, toggle } = props;
  return (
    <Paper className={classes.root}>
      <Grid container direction="row" wrap="nowrap">
        <Grid item>
          <Toggle checked={enabled} onChange={toggle} />
        </Grid>
        <Grid item>
          <Typography className={classes.header} variant="body1" >
            Auto Enroll All New Linodes in Backups
          </Typography>
          <Typography variant="body1" >
            Enroll all future Linodes in backups. Your account will be billed
            the additional hourly rate noted on the
            <a href="https://www.linode.com/backups"> Backups pricing page</a>.
          </Typography>
          </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(AutoEnroll);
