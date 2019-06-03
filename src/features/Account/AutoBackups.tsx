import OpenInNew from '@material-ui/icons/OpenInNew';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';

type ClassNames = 'root' | 'footnote' | 'link' | 'icon';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  footnote: {
    fontSize: 14,
    cursor: 'pointer'
  },
  link: {
    textDecoration: 'underline'
  },
  icon: {
    display: 'inline-block',
    fontSize: '0.8em',
    marginLeft: theme.spacing(1) / 3
  }
});

interface Props {
  backups_enabled: boolean;
  hasLinodesWithoutBackups: boolean;
  onChange: () => void;
  openBackupsDrawer: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const AutoBackups: React.StatelessComponent<CombinedProps> = props => {
  const {
    backups_enabled,
    classes,
    hasLinodesWithoutBackups,
    onChange,
    openBackupsDrawer
  } = props;

  return (
    <React.Fragment>
      <ExpansionPanel heading="Backup Auto Enrollment" defaultExpanded={true}>
        <Grid container direction="column" className={classes.root}>
          <Grid item>
            <Typography variant="h2">Back Up All New Linodes</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1">
              This controls whether Linode Backups are enabled, by default, for
              all Linodes when they are initially created. For each Linode with
              Backups enabled, your account will be billed the additional hourly
              rate noted on the
              <a
                data-qa-backups-price
                href="https://linode.com/backups"
                target="_blank"
              >
                {` Backups pricing page`}
                <OpenInNew className={classes.icon} />
              </a>
              .
            </Typography>
          </Grid>
          <Grid item container direction="row" alignItems="center">
            <Grid item>
              <FormControlLabel
                // className="toggleLabel"
                control={
                  <Toggle
                    onChange={onChange}
                    checked={backups_enabled}
                    data-qa-toggle-auto-backup
                  />
                }
                label={
                  backups_enabled
                    ? 'Enabled (Auto enroll all new Linodes in Backups)'
                    : "Disabled (Don't enroll new Linodes in Backups automatically)"
                }
              />
            </Grid>
          </Grid>
          {!backups_enabled && hasLinodesWithoutBackups && (
            <Grid item>
              <Typography variant="body1" className={classes.footnote}>
                {`For existing Linodes without backups, `}
                <a
                  data-qa-backup-existing
                  className={classes.link}
                  onClick={openBackupsDrawer}
                >
                  enable now
                </a>
                .
              </Typography>
            </Grid>
          )}
        </Grid>
      </ExpansionPanel>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(AutoBackups);
