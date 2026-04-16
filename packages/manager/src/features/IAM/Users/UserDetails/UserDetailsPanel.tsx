import { Box, Button, Paper, Stack, Typography } from '@linode/ui';
import { Divider } from '@mui/material';
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
      value: (
        <MaskableText
          isToggleable
          sxTypography={(theme) => ({ font: theme.font.bold })}
          text={activeUser.username}
        />
      ),
    },
    {
      label: 'Email',
      value: (
        <MaskableText
          isToggleable
          sxTypography={(theme) => ({ font: theme.font.bold })}
          text={activeUser.email}
        />
      ),
    },
    {
      label: 'Assigned roles',
      value: (
        <Typography sx={(theme) => ({ font: theme.font.bold })}>
          {assignRolesCount}
        </Typography>
      ),
    },
    {
      label: 'Last login status',
      value: (
        <Stack direction="row" spacing={1}>
          <Typography
            sx={(theme) => ({ font: theme.font.bold })}
            textTransform="capitalize"
          >
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
        <DateTimeDisplay
          sx={(theme) => ({ font: theme.font.bold })}
          value={activeUser.last_login.login_datetime}
        />
      ) : (
        <Typography sx={(theme) => ({ font: theme.font.bold })}>N/A</Typography>
      ),
    },
    {
      label: 'Password created',
      value: activeUser.password_created ? (
        <DateTimeDisplay
          sx={(theme) => ({ font: theme.font.bold })}
          value={activeUser.password_created}
        />
      ) : (
        <Typography sx={(theme) => ({ font: theme.font.bold })}>N/A</Typography>
      ),
    },
    {
      label: '2FA',
      value: (
        <Typography sx={(theme) => ({ font: theme.font.bold })}>
          {activeUser.tfa_enabled ? 'Enabled' : 'Disabled'}
        </Typography>
      ),
    },
    {
      label: 'Verified number',
      value: (
        <MaskableText
          isToggleable
          sxTypography={(theme) => ({ font: theme.font.bold })}
          text={activeUser.verified_phone_number ?? 'None'}
        />
      ),
    },
    {
      label: 'SSH keys',
      value:
        activeUser.ssh_keys.length > 0 ? (
          <TextTooltip
            displayText={String(activeUser.ssh_keys.length)}
            minWidth={1}
            sxTypography={(theme) => ({ font: theme.font.bold })}
            tooltipText={activeUser.ssh_keys.join(', ')}
          />
        ) : (
          <Typography sx={(theme) => ({ font: theme.font.bold })}>0</Typography>
        ),
    },
  ];

  return (
    <Paper>
      <Box sx={(theme) => ({ py: theme.spacingFunction(8) })}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ flex: 1 }} variant="h2">
            User Details
          </Typography>
          <Button>Edit Details</Button>
          <Button>Delete User</Button>
        </Box>
        <Divider
          sx={(theme) => ({
            marginTop: theme.spacingFunction(24),
            marginBottom: theme.spacingFunction(16),
          })}
        />
      </Box>
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
              direction="column"
              spacing={0.25}
              sx={{
                '& > p:nth-of-type(2)': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  alignItems: 'center',
                },
              }}
            >
              <Typography>{item.label}</Typography>
              {item.value}
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
