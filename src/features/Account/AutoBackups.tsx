import * as React from 'react';



import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';


type ClassNames = 'root' | 'footnote';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  footnote: {
    fontSize: 14,
  },
});

interface Props {
  backups_enabled: boolean;
  error: any;
  handleToggle: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const AutoBackups: React.StatelessComponent<CombinedProps> = (props) => {

  const { backups_enabled, classes, error, handleToggle } = props;

  return (
    <React.Fragment>
      <ExpansionPanel
        heading="Backup Auto Enrollment"
      >
        <Grid container direction="column" className={classes.root}>
          <Grid item>
            <Typography variant="title">
              Back Up All New Linodes
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1">
              This controls whether Linode Backups are enabled, by default, for all Linodes when
              they are initially created. For each Linode with Backups enabled, your account will
              be billed the additional hourly rate noted on the
              <a href="https://linode.com/backups">{` Backups pricing page`}</a>.
            </Typography>
          </Grid>
          {error &&
            <Grid item>
              <Notice error text="There was an error updating your account settings." />
            </Grid>
          }
          <Grid item container direction="row" alignItems="center">
            <Grid item>
              <Toggle
                onChange={handleToggle}
                checked={backups_enabled}
              />
            </Grid>
            <Grid item>
            <Typography variant="body1">
              {backups_enabled
                ? "Auto Enroll All New Linodes in Backups"
                : "Don't Enroll New Linodes in Backups Automatically"
              }
            </Typography>
            </Grid>
          </Grid>
          {/* Uncomment after BackupDrawer is merged */}
          <Grid item>
            <Typography variant="body1" className={classes.footnote}>
              For existing Linodes without backups, <a>enable now</a>.
            </Typography>
          </Grid>
        </Grid>
      </ExpansionPanel>
    </React.Fragment>
  );
}

const styled = withStyles(styles, { withTheme: true });

export default styled(AutoBackups);
