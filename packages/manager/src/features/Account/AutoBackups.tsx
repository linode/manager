import { makeStyles, Theme } from 'src/components/core/styles';
import * as React from 'react';
import Accordion from 'src/components/Accordion';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import OpenInNew from '@material-ui/icons/OpenInNew';
import Toggle from 'src/components/Toggle';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  footnote: {
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  icon: {
    display: 'inline-block',
    fontSize: '0.8em',
    marginLeft: theme.spacing(1) / 3,
  },
  enableBackupsButton: {
    ...theme.applyLinkStyles,
    fontSize: '0.875rem',
  },
}));

interface Props {
  backups_enabled: boolean;
  hasLinodesWithoutBackups: boolean;
  onChange: () => void;
  openBackupsDrawer: () => void;
  isManagedCustomer: boolean;
}

const AutoBackups: React.FC<Props> = (props) => {
  const {
    backups_enabled,
    hasLinodesWithoutBackups,
    onChange,
    openBackupsDrawer,
    isManagedCustomer,
  } = props;

  const classes = useStyles();

  return (
    <Accordion heading="Backup Auto Enrollment" defaultExpanded={true}>
      <Grid container direction="column">
        <Grid item>
          {!!isManagedCustomer ? (
            <Notice success spacingBottom={20}>
              You&rsquo;re a Managed customer, which means your Linodes are
              already automatically backed up - no need to toggle this setting.
            </Notice>
          ) : null}
          <Typography variant="body1">
            This controls whether Linode Backups are enabled, by default, for
            all Linodes when they are initially created. For each Linode with
            Backups enabled, your account will be billed the additional hourly
            rate noted on the&nbsp;
            <a
              data-qa-backups-price
              href="https://linode.com/backups"
              target="_blank"
              aria-describedby="external-site"
              rel="noopener noreferrer"
            >
              Backups pricing page
              <OpenInNew className={classes.icon} />
            </a>
            .
          </Typography>
        </Grid>
        <Grid item container direction="row" alignItems="center">
          <Grid item>
            <FormControlLabel
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
                  : 'Disabled (Don\u{2019}t enroll new Linodes in Backups automatically)'
              }
            />
          </Grid>
        </Grid>
        {!isManagedCustomer && !backups_enabled && hasLinodesWithoutBackups && (
          <Grid item>
            <Typography variant="body1" className={classes.footnote}>
              For existing Linodes without backups,&nbsp;
              <button
                data-qa-backup-existing
                onClick={openBackupsDrawer}
                className={classes.enableBackupsButton}
              >
                enable now
              </button>
              .
            </Typography>
          </Grid>
        )}
      </Grid>
    </Accordion>
  );
};

export default AutoBackups;
