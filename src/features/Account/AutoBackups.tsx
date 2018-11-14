import { pathOr } from 'ramda';
import * as React from 'react';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';


type ClassNames = 'root' | 'footnote' | 'link';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  footnote: {
    fontSize: 14,
  },
  link: {
    textDecoration: 'underline',
  }
});

interface Props {
  backups_enabled: boolean;
  errors?: Linode.ApiFieldError[];
  handleToggle: () => void;
  openBackupsDrawer: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const displayError = (errors: Linode.ApiFieldError[]) => {
  return pathOr(
    "There was an error updating your account settings.",
    ['response', 'data', 'errors', 0, 'reason'],
    errors
    )
}

const AutoBackups: React.StatelessComponent<CombinedProps> = (props) => {

  const { backups_enabled, classes, errors, handleToggle, openBackupsDrawer } = props;

  return (
    <React.Fragment>
      <ExpansionPanel
        heading="Backup Auto Enrollment"
        defaultExpanded={true}
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
              be billed the additional hourly rate noted on the <a href="https://linode.com/backups">{` Backups pricing page`}</a>.
            </Typography>
          </Grid>
          {errors &&
            <Grid item>
              <Notice error text={displayError(errors)} />
            </Grid>
          }
          <Grid item container direction="row" alignItems="center">
            <Grid item>
              <FormControlLabel
                // className="toggleLabel"
                control={
                  <Toggle
                    onChange={handleToggle}
                    checked={backups_enabled}
                  />
                }
                label={backups_enabled
                  ? "Enabled (Auto Enroll All New Linodes in Backups)"
                  : "Disabled (Don't Enroll New Linodes in Backups Automatically)"
                }
              />
            </Grid>
          </Grid>
          <Grid item>
            <Typography variant="body1" className={classes.footnote}>
              {`For existing Linodes without backups, `}
              <span className={classes.link} onClick={openBackupsDrawer}>enable now</span>.
            </Typography>
          </Grid>
        </Grid>
      </ExpansionPanel>
    </React.Fragment>
  );
}

const styled = withStyles(styles, { withTheme: true });

export default styled(AutoBackups);
