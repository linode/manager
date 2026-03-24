import { useProfile } from '@linode/queries';
import { Box, Chip, Stack, Tooltip, TooltipIcon, Typography } from '@linode/ui';
import { capitalize, truncateEnd } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { Avatar } from 'src/components/Avatar/Avatar';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { useIsIAMDelegationEnabled } from '../../hooks/useIsIAMEnabled';
import { usePermissions } from '../../hooks/usePermissions';
import {
  IAM_CHILD_USERS_PENDO_IDS,
  IAM_PARENT_USERS_PENDO_IDS,
} from '../../Shared/constants';
import { UsersActionMenu } from './UsersActionMenu';

import type { User } from '@linode/api-v4';

interface Props {
  onDelete: (username: string) => void;
  user: User;
}

export const UserRow = ({ onDelete, user }: Props) => {
  const theme = useTheme();

  const { data: profile } = useProfile();
  const { data: permissions } = usePermissions('account', [
    'delete_user',
    'is_account_admin',
    'view_user',
  ]);

  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const { isChildUserType, isDelegateUserType } = useDelegationRole();

  const canViewUser = permissions.view_user;

  // Determine if the current user is a child or delegate profile with isIAMDelegationEnabled enabled
  // If so, we need to show the 'User type' column in the table
  const isChildOrDelegateWithDelegationEnabled =
    isIAMDelegationEnabled && (isChildUserType || isDelegateUserType);

  return (
    <TableRow data-qa-table-row={user.username} key={user.username}>
      <TableCell>
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <Avatar
            color={
              user.username !== profile?.username
                ? theme.palette.primary.dark
                : undefined
            }
            username={user.username}
          />
          <MaskableText isToggleable text={user.username}>
            <Tooltip
              placement="bottom"
              title={user.username.length > 32 ? user.username : null}
            >
              <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {canViewUser ? (
                  <Link
                    data-pendo-id={
                      user.user_type === 'child'
                        ? IAM_CHILD_USERS_PENDO_IDS.childUsernameLink
                        : user.user_type === 'delegate'
                          ? IAM_CHILD_USERS_PENDO_IDS.delegateUsernameLink
                          : IAM_PARENT_USERS_PENDO_IDS.parentUsernameLink
                    }
                    to={
                      isChildOrDelegateWithDelegationEnabled &&
                      user.user_type === 'delegate'
                        ? `/iam/users/${user.username}/roles`
                        : `/iam/users/${user.username}/details`
                    }
                  >
                    {truncateEnd(user.username, 32)}
                  </Link>
                ) : (
                  truncateEnd(user.username, 32)
                )}
              </Typography>
            </Tooltip>
          </MaskableText>
          <Box display="flex" flexGrow={1} />
          {user.tfa_enabled && <Chip color="success" label="2FA" />}
        </Stack>
      </TableCell>
      {isChildOrDelegateWithDelegationEnabled && (
        <TableCell sx={{ display: { lg: 'table-cell', xs: 'none' } }}>
          <Typography>
            {user.user_type === 'child' ? 'User' : 'Delegate User'}
          </Typography>
        </TableCell>
      )}
      <TableCell
        sx={{
          '& > p': { overflow: 'hidden', textOverflow: 'ellipsis' },
          display: { sm: 'table-cell', xs: 'none' },
        }}
      >
        {isChildOrDelegateWithDelegationEnabled ? (
          user.user_type === 'child' ? (
            <MaskableText isToggleable text={user.email} />
          ) : (
            <Typography>
              Not applicable{' '}
              <TooltipIcon
                status="info"
                sxTooltipIcon={{
                  marginLeft: '-9px',
                  marginTop: '-5px',
                }}
                text="E-mail addresses of delegate users are not displayed."
                tooltipPosition="right"
              />
            </Typography>
          )
        ) : (
          <MaskableText isToggleable text={user.email} />
        )}
      </TableCell>
      <TableCell sx={{ display: { lg: 'table-cell', xs: 'none' } }}>
        <LastLogin last_login={user.last_login} user_type={user.user_type} />
      </TableCell>

      <TableCell actionCell>
        <UsersActionMenu
          onDelete={onDelete}
          permissions={permissions}
          username={user.username}
          userType={user.user_type}
        />
      </TableCell>
    </TableRow>
  );
};

/**
 * Display information about a Users last login
 *
 * - The component renders "Never" if last_login is `null`
 * - The component renders "Not applicable" if the user is a delegate user
 * - The component renders a date if last_login is a success
 * - The component renders a date and a status if last_login is a failure
 */
const LastLogin = (props: Pick<User, 'last_login' | 'user_type'>) => {
  const { last_login, user_type } = props;

  if (user_type === 'delegate') {
    return (
      <Typography>
        Not applicable
        <TooltipIcon
          status="info"
          sxTooltipIcon={{
            marginLeft: '-9px',
            marginTop: '-5px',
          }}
          text="Last login of delegate users is not displayed."
          tooltipPosition="right"
        />
      </Typography>
    );
  }

  if (last_login === null) {
    return <Typography>Never</Typography>;
  }

  if (last_login.status === 'successful') {
    return <DateTimeDisplay value={last_login.login_datetime} />;
  }

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      <DateTimeDisplay value={last_login.login_datetime} />
      <Typography>&#8212;</Typography>
      <StatusIcon status="error" />
      <Typography>{capitalize(last_login.status)}</Typography>
    </Stack>
  );
};
