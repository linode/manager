import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import { Color, Font, Spacing, Typography } from '@akamai/cds-tokens';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { useActiveBreakpointIndex } from '../../hooks/useBreakpoint';
import { useDelegationRole } from '../../hooks/useDelegationRole';
import { useIsIAMTfaEnforcementEnabled } from '../../hooks/useIsIAMTfaEnforcementEnabled';
import { IAM_USERS_USER_DETAILS_PENDO_IDS } from '../../LoginSettings/constants';
import { Box } from '../../Shared/Box/Box';
import { EMAIL_MAX_LENGTH } from '../../Shared/constants';
import { DateTimeDisplay } from '../../Shared/DateTimeDisplay/DateTimeDisplay';
import { Divider } from '../../Shared/Divider/Divider';
import { MaskableText } from '../../Shared/MaskableText/MaskableText';
import { Paper } from '../../Shared/Paper/Paper';
import { StatusIcon } from '../../Shared/StatusIcon/StatusIcon';
import { truncateEnd } from '../../Shared/truncate';
import { UserDeleteConfirmation } from '../../Shared/UserDeleteConfirmation';
import { getDeleteUserTooltipText } from '../../Shared/utilities';
import { EditUserDetailsDrawer } from './EditUserDetailsDrawer';
import styles from './UserDetailsPanel.module.css';
import { getTfaStatus, getTotalAssignedRoles } from './utils';

import type { IAMAction } from '../../routes';
import type { IamUserRoles, User } from '@linode/api-v4';

interface ItemsGridStyle extends React.CSSProperties {
  '--items-grid-columns': number;
}

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
  const navigate = useNavigate();
  const { action } = useSearch({
    from: '/iam/users/$username/details',
  });
  const { profileUserName } = useDelegationRole();
  const { isIAMTfaEnforcementEnabled } = useIsIAMTfaEnforcementEnabled();
  const { iconStatus: tfaIconStatus, label: tfaLabel } = getTfaStatus(
    activeUser.tfa_enabled,
    activeUser.tfa_enforced,
    isIAMTfaEnforcementEnabled
  );

  const isDelegateUserType = activeUser.user_type === 'delegate';

  const breakpointIndex = useActiveBreakpointIndex();
  // xs=1 col, sm=2 cols, md+=3 cols
  let gridColumnsCount = 1;
  if (breakpointIndex >= 2) {
    gridColumnsCount = 3;
  } else if (breakpointIndex >= 1) {
    gridColumnsCount = 2;
  }
  const itemsGridStyle: ItemsGridStyle = {
    '--items-grid-columns': gridColumnsCount,
  };

  const isDeleteUserDisabled =
    !permissions.delete_user ||
    profileUserName === activeUser.username ||
    isDelegateUserType;

  const isEditUserDisabled =
    profileUserName !== activeUser.username ? !permissions.update_user : false;

  const editTooltipText = 'You do not have permission to edit this user.';

  const deleteTooltipText = getDeleteUserTooltipText(
    permissions.delete_user,
    profileUserName,
    activeUser.username,
    isDelegateUserType
  );

  const assignRolesCount = assignedRoles
    ? getTotalAssignedRoles(assignedRoles)
    : 0;

  const actionHandler = (action: IAMAction, username: string) => {
    navigate({
      to: `/iam/users/${username}/details`,
      search: (prev) => ({
        ...prev,
        action,
      }),
    });
  };

  const handleDeleteUser = (username: string) => {
    actionHandler('delete-user', username);
  };

  const handleEditUser = (username: string) => {
    actionHandler('edit-user', username);
  };

  const handleCloseDialog = (expectedAction?: IAMAction) => {
    if (expectedAction && action !== expectedAction) {
      return;
    }

    navigate({
      params: { username: activeUser.username },
      search: (prev) => ({
        ...prev,
        action: undefined,
      }),
      to: '/iam/users/$username/details',
    });
  };

  const items = [
    {
      label: 'Username',
      value: (
        <MaskableText
          isToggleable
          styleTypography={{ font: Typography.Body.Bold }}
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
              font: Typography.Body.Bold,
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
        <p
          style={{
            // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            fontWeight: Font.FontWeight.Bold,
          }}
        >
          {assignRolesCount}
        </p>
      ),
    },
    {
      label: 'Last login status',
      value: (
        <Box direction="row">
          {activeUser.last_login && (
            <StatusIcon
              status={
                activeUser.last_login?.status === 'successful'
                  ? 'active'
                  : 'error'
              }
            />
          )}
          <p
            style={{
              // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
              fontWeight: Font.FontWeight.Bold,
              textTransform: 'capitalize',
            }}
          >
            {activeUser.last_login?.status ?? 'N/A'}
          </p>
        </Box>
      ),
    },
    {
      label: 'Last login',
      value: activeUser.last_login ? (
        <DateTimeDisplay
          style={{ font: Typography.Body.Bold }}
          value={activeUser.last_login.login_datetime}
        />
      ) : (
        <p
          style={{
            // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            fontWeight: Font.FontWeight.Bold,
          }}
        >
          N/A
        </p>
      ),
    },
    {
      label: 'Password created',
      value: activeUser.password_created ? (
        <DateTimeDisplay
          style={{
            // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            fontWeight: Font.FontWeight.Bold,
          }}
          value={activeUser.password_created}
        />
      ) : (
        <p
          style={{
            // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            fontWeight: Font.FontWeight.Bold,
          }}
        >
          N/A
        </p>
      ),
    },
    {
      label: 'Two-factor authentication',
      value: (
        <Box direction="row">
          <StatusIcon
            pulse={false}
            status={tfaIconStatus}
            style={{ alignSelf: 'center' }}
          />
          <p
            style={{
              // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
              fontWeight: Font.FontWeight.Bold,
            }}
          >
            {tfaLabel}
          </p>
        </Box>
      ),
    },
    {
      label: 'Verified number',
      value: (
        <MaskableText
          isToggleable
          styleTypography={{ font: Typography.Body.Bold }}
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
          <p
            style={{
              // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
              fontWeight: Font.FontWeight.Bold,
            }}
          >
            0
          </p>
        ),
    },
  ];

  return (
    <Paper>
      <Box
        direction="row"
        style={{
          alignItems: 'center',
          gap: 24,
        }}
      >
        <h2 style={{ flex: 1, font: Typography.Heading.S }}>User Details</h2>
        <Tooltip disabled={!isEditUserDisabled} tooltipText={editTooltipText}>
          <Button
            data-pendo-id={IAM_USERS_USER_DETAILS_PENDO_IDS.editDetails}
            disabled={isEditUserDisabled}
            onClick={() => handleEditUser(activeUser.username)}
            variant="link"
          >
            Edit Details
            {isEditUserDisabled ? <Icon icon="info-outline" size="m" /> : null}
          </Button>
        </Tooltip>
        <Tooltip
          disabled={!isDeleteUserDisabled}
          tooltipText={deleteTooltipText}
        >
          <Button
            data-pendo-id={IAM_USERS_USER_DETAILS_PENDO_IDS.deleteUser}
            disabled={isDeleteUserDisabled}
            onClick={() => handleDeleteUser(activeUser.username)}
            variant="link"
          >
            Delete User
            {isDeleteUserDisabled ? (
              <Icon icon="info-outline" size="m" />
            ) : null}
          </Button>
        </Tooltip>
      </Box>
      <Divider spacingBottom={Spacing.S16} spacingTop={Spacing.S16} />

      <div className={styles.itemsGrid} style={itemsGridStyle}>
        {items.map((item) => (
          <Box className={styles.itemBox} key={item.label}>
            <p>{item.label}</p>
            {item.value}
          </Box>
        ))}
      </div>
      <EditUserDetailsDrawer
        activeUser={activeUser}
        canUpdateUser={permissions?.update_user}
        onClose={() => handleCloseDialog('edit-user')}
        open={action === 'edit-user'}
      />
      <UserDeleteConfirmation
        onClose={() => handleCloseDialog('delete-user')}
        onSuccess={() => navigate({ to: '/iam/users' })}
        open={action === 'delete-user'}
        username={activeUser.username}
      />
    </Paper>
  );
};
