import { Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { capitalize, truncateEnd } from '@akamai/compute-ui-core/formatting';
import { useProfile } from '@linode/queries';
import { Box, Chip, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { Avatar } from 'src/components/Avatar/Avatar';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { useIsIAMDelegationEnabled } from '../../hooks/useIsIAMEnabled';
import { usePermissions } from '../../hooks/usePermissions';
import {
  IAM_CHILD_USERS_PENDO_IDS,
  IAM_DELEGATE_USERS_PENDO_IDS,
  IAM_PARENT_USERS_PENDO_IDS,
} from '../../Shared/constants';
import { Link } from '../../Shared/Link/Link';
import { MaskableText } from '../../Shared/MaskableText/MaskableText';
import { StatusIcon } from '../../Shared/StatusIcon/StatusIcon';
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
              disabled={user.username.length <= 32}
              tooltipPlacement="bottom"
              tooltipText={user.username}
            >
              <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {canViewUser ? (
                  <Link
                    data-pendo-id={
                      user.user_type === 'child'
                        ? IAM_CHILD_USERS_PENDO_IDS.childUsernameLink
                        : user.user_type === 'delegate'
                          ? IAM_DELEGATE_USERS_PENDO_IDS.delegateUsernameLink
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
        <UserEmailContent
          isChildOrDelegateWithDelegationEnabled={
            isChildOrDelegateWithDelegationEnabled
          }
          userEmail={user.email}
          userType={user.user_type}
        />
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
      <NotApplicableWithTooltip tooltipText="Last login of delegate users is not displayed." />
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

/**
 * Displays the email of a user
 *
 * - The component renders "Not applicable" if the user is a delegate and IAM Delegation is enabled
 * - The component renders the user's email with the ability to toggle visibility for all other cases
 */
const UserEmailContent = ({
  isChildOrDelegateWithDelegationEnabled,
  userEmail,
  userType,
}: {
  isChildOrDelegateWithDelegationEnabled: boolean;
  userEmail: string;
  userType: User['user_type'];
}) => {
  if (!isChildOrDelegateWithDelegationEnabled || userType === 'child') {
    return <MaskableText isToggleable text={userEmail} />;
  }

  return (
    <NotApplicableWithTooltip tooltipText="E-mail addresses of delegate users are not displayed." />
  );
};

/**
 * Displays "Not applicable" with a tooltip for delegate users
 */
const NotApplicableWithTooltip = ({ tooltipText }: { tooltipText: string }) => (
  <Typography>
    Not applicable{' '}
    <Tooltip tooltipPlacement="left" tooltipText={tooltipText}>
      <Icon icon="info-outline" size="m" style={{ marginBottom: Spacing.S4 }} />
    </Tooltip>
  </Typography>
);
