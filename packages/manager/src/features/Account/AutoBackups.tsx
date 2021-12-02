import OpenInNew from '@material-ui/icons/OpenInNew';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Accordion from 'src/components/Accordion';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';
import Notice from 'src/components/Notice';
import Button from 'src/components/Button';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  footnote: {
    fontSize: 14,
    cursor: 'pointer',
  },
  icon: {
    display: 'inline-block',
    fontSize: '0.8em',
    marginLeft: theme.spacing(1) / 3,
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
      <Grid container direction="column" className={classes.root}>
        <Grid item>
          {!!isManagedCustomer ? (
            <Notice success>
              You're a Managed customer, which means your Linodes are already
              automatically backed up - no need to toggle this setting.
            </Notice>
          ) : null}
          <Typography variant="body1">
            This controls whether Linode Backups are enabled, by default, for
            all Linodes when they are initially created. For each Linode with
            Backups enabled, your account will be billed the additional hourly
            rate noted on the &nbsp;
            <a
              data-qa-backups-price
              href="https://linode.com/backups"
              target="_blank"
              aria-describedby="external-site"
              rel="noopener noreferrer"
            >
              {`Backups pricing page`}
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
              <Button
                compact
                buttonType="secondary"
                data-qa-backup-existing
                onClick={openBackupsDrawer}
                title="enable now"
              >
                enable now
              </Button>
              .
            </Typography>
          </Grid>
        )}
      </Grid>
    </Accordion>
  );
};

export default AutoBackups;
