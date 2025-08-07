import {
  FormControlLabel,
  Notice,
  Paper,
  Stack,
  Toggle,
  Typography,
} from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

import { usePermissions } from '../IAM/hooks/usePermissions';

interface AutoEnrollProps {
  enabled: boolean;
  error?: string;
  toggle: () => void;
}

export const AutoEnroll = (props: AutoEnrollProps) => {
  const { enabled, error, toggle } = props;

  const { data: permissions } = usePermissions('account', [
    'update_account_settings',
  ]);
  return (
    <Paper
      sx={(theme) => ({ backgroundColor: theme.palette.background.default })}
      variant="outlined"
    >
      {error && <Notice text={error} variant="error" />}
      <FormControlLabel
        checked={enabled}
        control={<Toggle />}
        disabled={!permissions.update_account_settings}
        label={
          <Stack spacing={0.5}>
            <Typography sx={(theme) => ({ font: theme.font.bold })}>
              Auto Enroll All New Linodes in Backups
            </Typography>
            <Typography variant="body1">
              Enroll all future Linodes in backups. Your account will be billed
              the additional hourly rate noted on the{' '}
              <Link
                data-qa-backups-price
                to="https://www.linode.com/pricing/#backups"
              >
                Backups pricing page
              </Link>
              .
            </Typography>
          </Stack>
        }
        onChange={toggle}
        sx={{ gap: 1 }}
      />
    </Paper>
  );
};
