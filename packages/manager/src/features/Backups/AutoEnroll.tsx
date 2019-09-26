import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';

type ClassNames = 'root' | 'header' | 'toggleLabel' | 'toggleLabelText';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.bg.offWhite,
      padding: theme.spacing(1)
    },
    header: {
      marginBottom: theme.spacing(1),
      fontSize: 17
    },
    toggleLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      marginLeft: 0,
      marginBottom: theme.spacing(1)
    },
    toggleLabelText: {
      marginTop: theme.spacing(1) + theme.spacing(1) / 2
    }
  });

interface Props {
  enabled: boolean;
  error?: string;
  toggle: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const AutoEnroll: React.StatelessComponent<CombinedProps> = props => {
  const { classes, enabled, error, toggle } = props;
  return (
    <Paper className={classes.root}>
      {error && (
        <Grid item>
          <Notice error text={error} />
        </Grid>
      )}
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
                <Typography className={classes.header}>
                  Auto Enroll All New Linodes in Backups
                </Typography>
                <Typography variant="body1">
                  {`Enroll all future Linodes in backups. Your account will be billed
                    the additional hourly rate noted on the `}
                  <ExternalLink
                    data-qa-backups-price
                    fixedIcon
                    link="https://www.linode.com/backups"
                    text="Backups pricing page"
                  />
                </Typography>
              </div>
            }
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(AutoEnroll);
