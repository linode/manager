import {
  FormControlLabel,
  Notice,
  Paper,
  Stack,
  Toggle,
  Typography,
} from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  enableBackupsButton: {
    ...theme.applyLinkStyles,
    fontSize: '0.875rem',
  },
  footnote: {
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  icon: {
    display: 'inline-block',
    fontSize: '0.8em',
    marginLeft: `calc(${theme.spacingFunction(8)} / 3)`,
  },
}));

interface Props {
  backups_enabled: boolean;
  hasLinodesWithoutBackups: boolean;
  isManagedCustomer: boolean;
  onChange: () => void;
  openBackupsDrawer: () => void;
}

const AutoBackups = (props: Props) => {
  const {
    backups_enabled,
    hasLinodesWithoutBackups,
    isManagedCustomer,
    onChange,
    openBackupsDrawer,
  } = props;

  const { classes } = useStyles();

  return (
    <Paper>
      <Typography variant="h2">Backup Auto Enrollment</Typography>
      {isManagedCustomer && (
        <Notice spacingBottom={16} spacingTop={16} variant="info">
          You&rsquo;re a Managed customer, which means your Linodes are already
          automatically backed up - no need to toggle this setting.
        </Notice>
      )}
      <Stack mt={1} spacing={1}>
        <Typography variant="body1">
          This controls whether Linode Backups are enabled, by default, for all
          Linodes when they are initially created. For each Linode with Backups
          enabled, your account will be billed the additional hourly rate noted
          on the&nbsp;
          <Link
            data-qa-backups-price
            to="https://www.linode.com/products/backups/"
          >
            Backups pricing page
          </Link>
          .
        </Typography>
        <Stack>
          <FormControlLabel
            control={
              <Toggle
                checked={isManagedCustomer ? true : backups_enabled}
                data-qa-toggle-auto-backup
                disabled={!!isManagedCustomer}
                onChange={onChange}
              />
            }
            label={
              backups_enabled || isManagedCustomer
                ? 'Enabled (Auto enroll all new Linodes in Backups)'
                : 'Disabled (Don\u{2019}t enroll new Linodes in Backups automatically)'
            }
          />
        </Stack>
        {!isManagedCustomer && !backups_enabled && hasLinodesWithoutBackups && (
          <Typography className={classes.footnote} variant="body1">
            For existing Linodes without backups,&nbsp;
            <button
              className={classes.enableBackupsButton}
              data-qa-backup-existing
              onClick={openBackupsDrawer}
            >
              enable now
            </button>
            .
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default AutoBackups;
