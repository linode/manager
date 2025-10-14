import { Paper, Stack, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TextTooltip } from 'src/components/TextTooltip';

import { getTotalAssignedRoles } from './utils';

import type { IamUserRoles, User } from '@linode/api-v4';

interface Props {
  activeUser: User;
  assignedRoles?: IamUserRoles;
}

export const UserDetailsPanel = ({ assignedRoles, activeUser }: Props) => {
  const assignRolesCount = assignedRoles
    ? getTotalAssignedRoles(assignedRoles)
    : 0;

  const items = [
    {
      label: 'Username',
      value: <MaskableText isToggleable text={activeUser.username} />,
    },
    {
      label: 'Email',
      value: <MaskableText isToggleable text={activeUser.email} />,
    },
    {
      label: 'Assigned Roles',
      value: <Typography>{assignRolesCount}</Typography>,
    },
    {
      label: 'Last Login Status',
      value: (
        <Stack direction="row" spacing={1}>
          <Typography textTransform="capitalize">
            {activeUser.last_login?.status ?? 'N/A'}
          </Typography>
          {activeUser.last_login && (
            <StatusIcon
              status={
                activeUser.last_login?.status === 'successful'
                  ? 'active'
                  : 'error'
              }
              sx={{ alignSelf: 'center' }}
            />
          )}
        </Stack>
      ),
    },
    {
      label: 'Last login',
      value: activeUser.last_login ? (
        <DateTimeDisplay value={activeUser.last_login.login_datetime} />
      ) : (
        <Typography>N/A</Typography>
      ),
    },
    {
      label: 'Password Created',
      value: activeUser.password_created ? (
        <DateTimeDisplay value={activeUser.password_created} />
      ) : (
        <Typography>N/A</Typography>
      ),
    },
    {
      label: '2FA',
      value: (
        <Typography>
          {activeUser.tfa_enabled ? 'Enabled' : 'Disabled'}
        </Typography>
      ),
    },
    {
      label: 'Verified number',
      value: (
        <MaskableText
          isToggleable
          text={activeUser.verified_phone_number ?? 'None'}
        />
      ),
    },
    {
      label: 'SSH Keys',
      value:
        activeUser.ssh_keys.length > 0 ? (
          <TextTooltip
            displayText={String(activeUser.ssh_keys.length)}
            minWidth={1}
            tooltipText={activeUser.ssh_keys.join(', ')}
          />
        ) : (
          <Typography>0</Typography>
        ),
    },
  ];

  return (
    <Paper>
      <Grid columns={{ md: 6, sm: 4, xs: 2 }} container spacing={2}>
        {items.map((item) => (
          <Grid
            key={item.label}
            size={{
              md: 2,
              sm: 2,
              xs: 2,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                '& > p:nth-of-type(2)': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  alignItems: 'center',
                },
              }}
            >
              <Typography
                sx={(theme) => ({
                  font: theme.font.bold,
                })}
              >
                {item.label}:
              </Typography>
              {item.value}
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
