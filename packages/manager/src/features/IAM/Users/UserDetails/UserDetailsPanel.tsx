import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import {
  Color,
  Spacing,
  Typography as TypographyTokens,
} from '@akamai/cds-tokens';
import { Box, Stack, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { PARENT_USER } from 'src/features/Account/constants';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { EMAIL_MAX_LENGTH } from '../../Shared/constants';
import { Divider } from '../../Shared/Divider/Divider';
import { MaskableText } from '../../Shared/MaskableText/MaskableText';
import { Paper } from '../../Shared/Paper/Paper';
import { StatusIcon } from '../../Shared/StatusIcon/StatusIcon';
import { truncateEnd } from '../../Shared/truncate';
import { UserDeleteConfirmation } from '../../Shared/UserDeleteConfirmation';
import { EditUserDetailsDrawer } from './EditUserDetailsDrawer';
import { getTotalAssignedRoles } from './utils';

import type { IamUserRoles, User } from '@linode/api-v4';

interface Props {
  activeUser: User;
  assignedRoles?: IamUserRoles;
  permissions: {
    delete_user: boolean;
    list_user_permissions: boolean;
    update_user: boolean;
    view_user: boolean;
  };
}

export const UserDetailsPanel = ({
  assignedRoles,
  activeUser,
  permissions,
}: Props) => {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const navigate = useNavigate();
  const { profileUserName } = useDelegationRole();

  const isProxyOrDelegateUserType =
    activeUser.user_type === 'proxy' || activeUser.user_type === 'delegate';

  const isDeleteUserDisabled =
    !permissions.delete_user ||
    profileUserName === activeUser.username ||
    isProxyOrDelegateUserType;

  const isEditUserDisabled =
    profileUserName !== activeUser.username ? !permissions.update_user : false;

  const editTooltipText = 'You do not have permission to edit this user.';

  let deleteTooltipText: string | undefined;
  if (!permissions?.delete_user) {
    deleteTooltipText = 'You do not have permission to delete this user.';
  } else if (profileUserName === activeUser.username) {
    deleteTooltipText = `You can’t delete the currently active user.`;
  } else if (isProxyOrDelegateUserType) {
    deleteTooltipText = `You can’t delete a ${PARENT_USER}.`;
  }

  const assignRolesCount = assignedRoles
    ? getTotalAssignedRoles(assignedRoles)
    : 0;

  const items = [
    {
      label: 'Username',
      value: (
        <MaskableText
          isToggleable
          styleTypography={{ font: TypographyTokens.Body.Bold }}
          text={activeUser.username}
        />
      ),
    },
    {
      label: 'E-mail',
      value: (
        <Tooltip
          disabled={activeUser.email.length <= EMAIL_MAX_LENGTH}
          tooltipPlacement="top"
          tooltipText={activeUser.email}
        >
          <MaskableText
            isToggleable
            styleTypography={{
              font: TypographyTokens.Body.Bold,
              margin: Spacing.S0,
            }}
            text={truncateEnd(activeUser.email, EMAIL_MAX_LENGTH)}
          />
        </Tooltip>
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
        <Stack direction="row">
          {activeUser.last_login && (
            <StatusIcon
              status={
                activeUser.last_login?.status === 'successful'
                  ? 'active'
                  : 'error'
              }
            />
          )}
          <Typography
            sx={(theme) => ({ font: theme.font.bold })}
            textTransform="capitalize"
          >
            {activeUser.last_login?.status ?? 'N/A'}
          </Typography>
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
      label: 'Two-factor authentication',
      value: (
        <Stack direction="row">
          <StatusIcon
            status={activeUser.tfa_enabled ? 'active' : 'inactive'}
            style={{ alignSelf: 'center' }}
          />
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {activeUser.tfa_enabled ? 'Enabled' : 'Disabled'}
          </Typography>
        </Stack>
      ),
    },
    {
      label: 'Verified number',
      value: (
        <MaskableText
          isToggleable
          styleTypography={{ font: TypographyTokens.Body.Bold }}
          text={activeUser.verified_phone_number ?? 'None'}
        />
      ),
    },
    {
      label: 'SSH keys',
      value:
        activeUser.ssh_keys.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip
              tooltipPlacement="right"
              tooltipText={activeUser.ssh_keys.join(', ')}
            >
              <p
                style={{
                  marginRight: Spacing.S0,
                  marginTop: Spacing.S0,
                  color: Color.Brand[90],
                  cursor: 'pointer',
                  textDecoration: 'underline dotted ' + Color.Brand[90],
                  textUnderlineOffset: '4px',
                }}
              >
                {activeUser.ssh_keys.length}
              </p>
            </Tooltip>
          </div>
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
          <Tooltip disabled={!isEditUserDisabled} tooltipText={editTooltipText}>
            <Button
              disabled={isEditUserDisabled}
              onClick={() => setIsEditDrawerOpen(true)}
              variant="link"
            >
              Edit Details
              {isEditUserDisabled ? (
                <Icon icon="info-outline" size="m" />
              ) : null}
            </Button>
          </Tooltip>
          <Tooltip
            disabled={!isDeleteUserDisabled}
            tooltipText={deleteTooltipText}
          >
            <Button
              disabled={isDeleteUserDisabled}
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="link"
            >
              Delete User
              {isDeleteUserDisabled ? (
                <Icon icon="info-outline" size="m" />
              ) : null}
            </Button>
          </Tooltip>
        </Box>
        <Divider spacingBottom={Spacing.S16} spacingTop={Spacing.S24} />
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
      <EditUserDetailsDrawer
        activeUser={activeUser}
        canUpdateUser={permissions?.update_user}
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
      />
      <UserDeleteConfirmation
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => navigate({ to: '/iam/users' })}
        open={isDeleteDialogOpen}
        username={activeUser.username}
      />
    </Paper>
  );
};
