import { Paper, Stack, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TextTooltip } from 'src/components/TextTooltip';

import type { User } from '@linode/api-v4';

interface Props {
  user: User;
}

export const UserDetailsPanel = ({ user }: Props) => {
  const items = [
    {
      label: 'Username',
      value: <MaskableText isToggleable text={user.username} />,
    },
    {
      label: 'Email',
      value: <MaskableText isToggleable text={user.email} />,
    },
    {
      label: 'Account Access',
      value: <Typography>{user.restricted ? 'Limited' : 'Full'}</Typography>,
    },
    {
      label: 'Last Login Status',
      value: (
        <Stack direction="row" spacing={1}>
          <Typography textTransform="capitalize">
            {user.last_login?.status ?? 'N/A'}
          </Typography>
          {user.last_login && (
            <StatusIcon
              status={
                user.last_login?.status === 'successful' ? 'active' : 'error'
              }
            />
          )}
        </Stack>
      ),
    },
    {
      label: 'Last Login',
      value: user.last_login ? (
        <DateTimeDisplay value={user.last_login.login_datetime} />
      ) : (
        <Typography>N/A</Typography>
      ),
    },
    {
      label: 'Password Created',
      value: user.password_created ? (
        <DateTimeDisplay value={user.password_created} />
      ) : (
        <Typography>N/A</Typography>
      ),
    },
    {
      label: '2FA',
      value: (
        <Typography>{user.tfa_enabled ? 'Enabled' : 'Disabled'}</Typography>
      ),
    },
    {
      label: 'Verified Phone Number',
      value: (
        <MaskableText
          isToggleable
          text={user.verified_phone_number ?? 'None'}
        />
      ),
    },
    {
      label: 'SSH Keys',
      value:
        user.ssh_keys.length > 0 ? (
          <TextTooltip
            displayText={String(user.ssh_keys.length)}
            minWidth={1}
            tooltipText={user.ssh_keys.join(', ')}
          />
        ) : (
          <Typography>0</Typography>
        ),
    },
  ];

  return (
    <Paper>
      <Grid columns={{ md: 6, sm: 4, xs: 2 }} container spacing={2}>
        {items.map((item, index) => (
          <Grid
            key={index}
            size={{
              md: 2,
              sm: 2,
              xs: 2,
            }}
          >
            <Stack direction="row" spacing={1}>
              <Typography sx={(theme) => ({ font: theme.font.bold })}>
                {item.label}
              </Typography>
              {item.value}
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
