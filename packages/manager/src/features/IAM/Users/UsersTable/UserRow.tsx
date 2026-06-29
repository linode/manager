import {
  Badge,
  Icon,
  TableCell,
  TableRow,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { capitalize, truncateEnd } from '@akamai/compute-ui-core/formatting';
import React from 'react';

import { usePermissions } from '../../hooks/usePermissions';
import { Avatar } from '../../Shared/Avatar/Avatar';
import { Box } from '../../Shared/Box/Box';
import {
  IAM_CHILD_USERS_PENDO_IDS,
  IAM_DELEGATE_USERS_PENDO_IDS,
  IAM_PARENT_USERS_PENDO_IDS,
} from '../../Shared/constants';
import { DateTimeDisplay } from '../../Shared/DateTimeDisplay/DateTimeDisplay';
import { Link } from '../../Shared/Link/Link';
import { MaskableText } from '../../Shared/MaskableText/MaskableText';
import { StatusIcon } from '../../Shared/StatusIcon/StatusIcon';
import { UsersActionMenu } from './UsersActionMenu';
import {
  getUsersTableCellStyle,
  useUsersTableColumns,
} from './usersTableColumnsUtils';

import type { User } from '@linode/api-v4';
interface Props {
  onDelete: (username: string) => void;
  user: User;
}

export const UserRow = ({ onDelete, user }: Props) => {
  const {
    columnWidths,
    isChildOrDelegate,
    showEmail,
    showLastLogin,
    showUserType,
  } = useUsersTableColumns();

  const { data: permissions } = usePermissions('account', [
    'delete_user',
    'is_account_admin',
    'view_user',
  ]);

  const canViewUser = permissions.view_user;

  return (
    <TableRow data-qa-table-row={user.username} key={user.username} zebra>
      <TableCell style={getUsersTableCellStyle(columnWidths.username)}>
        <Box direction="row" style={{ alignItems: 'center', gap: Spacing.S12 }}>
          <Avatar username={user.username} />
          <MaskableText isToggleable text={user.username}>
            <Tooltip
              disabled={user.username.length <= 32}
              tooltipPlacement="bottom"
              tooltipText={user.username}
            >
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                      isChildOrDelegate && user.user_type === 'delegate'
                        ? `/iam/users/${user.username}/roles`
                        : `/iam/users/${user.username}/details`
                    }
                  >
                    {truncateEnd(user.username, 32)}
                  </Link>
                ) : (
                  truncateEnd(user.username, 32)
                )}
              </p>
            </Tooltip>
          </MaskableText>
          {user.tfa_enabled && (
            <Badge color="green" variant="solid">
              2FA
            </Badge>
          )}
        </Box>
      </TableCell>
      {showUserType && (
        <TableCell style={getUsersTableCellStyle(columnWidths.userType)}>
          <p>{user.user_type === 'child' ? 'User' : 'Delegate User'}</p>
        </TableCell>
      )}
      {showEmail ? (
        <TableCell style={getUsersTableCellStyle(columnWidths.email)}>
          <UserEmailContent
            isChildOrDelegate={isChildOrDelegate}
            userEmail={user.email}
            userType={user.user_type}
          />
        </TableCell>
      ) : null}
      {showLastLogin ? (
        <TableCell style={getUsersTableCellStyle(columnWidths.lastLogin)}>
          <LastLogin last_login={user.last_login} user_type={user.user_type} />
        </TableCell>
      ) : null}
      <TableCell style={getUsersTableCellStyle(columnWidths.actions)}>
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
    return <p>Never</p>;
  }

  if (last_login.status === 'successful') {
    return <DateTimeDisplay value={last_login.login_datetime} />;
  }

  return (
    <Box
      direction="row"
      style={{ alignItems: 'center', gap: Spacing.S8 }}
      wrap="nowrap"
    >
      <DateTimeDisplay value={last_login.login_datetime} />
      <p>&#8212;</p>
      <StatusIcon status="error" />
      <p>{capitalize(last_login.status)}</p>
    </Box>
  );
};

/**
 * Displays the email of a user
 *
 * - The component renders "Not applicable" if the user is a delegate and IAM Delegation is enabled
 * - The component renders the user's email with the ability to toggle visibility for all other cases
 */
const UserEmailContent = ({
  isChildOrDelegate,
  userEmail,
  userType,
}: {
  isChildOrDelegate: boolean;
  userEmail: string;
  userType: User['user_type'];
}) => {
  if (!isChildOrDelegate || userType === 'child') {
    return (
      <MaskableText
        isToggleable
        styleTypography={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          margin: 0,
        }}
        text={userEmail}
      />
    );
  }

  return (
    <NotApplicableWithTooltip tooltipText="E-mail addresses of delegate users are not displayed." />
  );
};

/**
 * Displays "Not applicable" with a tooltip for delegate users
 */
const NotApplicableWithTooltip = ({ tooltipText }: { tooltipText: string }) => (
  <p>
    Not applicable{' '}
    <Tooltip tooltipPlacement="left" tooltipText={tooltipText}>
      <Icon icon="info-outline" size="m" style={{ marginBottom: Spacing.S4 }} />
    </Tooltip>
  </p>
);
