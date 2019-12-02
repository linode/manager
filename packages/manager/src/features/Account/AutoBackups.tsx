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

import HelpIcon from 'src/components/HelpIcon';

type ClassNames = 'root' | 'footnote' | 'link' | 'icon' | 'toolTip';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    footnote: {
      fontSize: 14,
      cursor: 'pointer'
    },
    link: {
      background: 'none',
      color: theme.palette.primary.main,
      border: 'none',
      padding: 0,
      font: 'inherit',
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    icon: {
      display: 'inline-block',
      fontSize: '0.8em',
      marginLeft: theme.spacing(1) / 3
    },
    toolTip: {
      paddingTop: theme.spacing(1)
    }
  });

interface Props {
  backups_enabled: boolean;
  hasLinodesWithoutBackups: boolean;
  onChange: () => void;
  openBackupsDrawer: () => void;
  isManagedCustomer: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const AutoBackups: React.StatelessComponent<CombinedProps> = props => {
  const {
    backups_enabled,
    classes,
    hasLinodesWithoutBackups,
    onChange,
    openBackupsDrawer,
    isManagedCustomer
  } = props;

  return (
    <React.Fragment>
      <ExpansionPanel heading="Backup Auto Enrollment" defaultExpanded={true}>
        <Grid container direction="column" className={classes.root}>
          <Grid item>
            <Typography variant="h2">
              Back Up All New Linodes
              {!!isManagedCustomer && (
                <HelpIcon
                  className={classes.toolTip}
                  text={`You're a Managed customer, which means your Linodes are already automatically
              backed up - no need to toggle this setting.`}
                />
              )}
            </Typography>
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
                aria-describedby="external-site"
                rel="noopener noreferrer"
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
                    checked={!!isManagedCustomer ? true : backups_enabled}
                    data-qa-toggle-auto-backup
                    disabled={!!isManagedCustomer}
                  />
                }
                label={
                  backups_enabled || isManagedCustomer
                    ? 'Enabled (Auto enroll all new Linodes in Backups)'
                    : "Disabled (Don't enroll new Linodes in Backups automatically)"
                }
              />
            </Grid>
          </Grid>
          {!isManagedCustomer && !backups_enabled && hasLinodesWithoutBackups && (
            <Grid item>
              <Typography variant="body1" className={classes.footnote}>
                {`For existing Linodes without backups, `}
                <button
                  data-qa-backup-existing
                  className={classes.link}
                  onClick={openBackupsDrawer}
                  role="button"
                  title="enable now"
                >
                  enable now
                </button>
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
