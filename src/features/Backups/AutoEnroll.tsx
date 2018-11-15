import * as React from 'react';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import OpenInNew from '@material-ui/icons/OpenInNew';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';

type ClassNames = 'root'
  | 'header'
  | 'icon'
  | 'toggleLabel'
  | 'toggleLabelText';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.offWhite,
    padding: theme.spacing.unit,
  },
  header: {
    marginBottom: theme.spacing.unit,
    fontSize: 17
  },
  icon: {
    display: 'inline-block',
    fontSize: '0.8em',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    marginLeft: 0,
    marginBottom: theme.spacing.unit,
  },
  toggleLabelText: {
    marginTop: 12
  }
});

interface Props {
  enabled: boolean;
  error?: string;
  toggle: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const AutoEnroll: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, enabled, error, toggle } = props;
  return (
    <Paper className={classes.root}>
      {error &&
        <Grid item>
          <Notice error text={error} />
        </Grid>
      }
      <Grid container direction="row" wrap="nowrap">
        <Grid item>
          <FormControlLabel
            className={classes.toggleLabel}
            control={
              <Toggle
                checked={enabled}
                onChange={toggle}
                data-qa-enable-toggle
              />
            }
            label={
              <div className={classes.toggleLabelText}>
                <Typography className={classes.header} >
                  Auto Enroll All New Linodes in Backups
                </Typography>
                <Typography variant="caption" >
                  {
                    `Enroll all future Linodes in backups. Your account will be billed
                    the additional hourly rate noted on the `
                  }
                  <a href="https://www.linode.com/backups"
                    target="_blank"
                  >
                    Backups pricing page <OpenInNew className={classes.icon} />.
                  </a>

                </Typography>
              </div>
            }
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(AutoEnroll);
