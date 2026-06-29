import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import { Color, Font, Spacing, Typography } from '@akamai/cds-tokens';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { PARENT_USER } from 'src/features/Account/constants';

import { useActiveBreakpointIndex } from '../../hooks/useBreakpoint';
import { useDelegationRole } from '../../hooks/useDelegationRole';
import { Box } from '../../Shared/Box/Box';
import { EMAIL_MAX_LENGTH } from '../../Shared/constants';
import { DateTimeDisplay } from '../../Shared/DateTimeDisplay/DateTimeDisplay';
import { Divider } from '../../Shared/Divider/Divider';
import { MaskableText } from '../../Shared/MaskableText/MaskableText';
import { Paper } from '../../Shared/Paper/Paper';
import { StatusIcon } from '../../Shared/StatusIcon/StatusIcon';
import { truncateEnd } from '../../Shared/truncate';
import { UserDeleteConfirmation } from '../../Shared/UserDeleteConfirmation';
import { EditUserDetailsDrawer } from './EditUserDetailsDrawer';
import styles from './UserDetailsPanel.module.css';
import { getTotalAssignedRoles } from './utils';

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
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const navigate = useNavigate();
  const { profileUserName } = useDelegationRole();

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

  let deleteTooltipText: string | undefined;
  if (!permissions?.delete_user) {
    deleteTooltipText = 'You do not have permission to delete this user.';
  } else if (profileUserName === activeUser.username) {
    deleteTooltipText = `You can’t delete the currently active user.`;
  } else if (isDelegateUserType) {
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
            status={activeUser.tfa_enabled ? 'active' : 'inactive'}
            style={{ alignSelf: 'center' }}
          />
          <p
            style={{
              // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
              fontWeight: Font.FontWeight.Bold,
            }}
          >
            {activeUser.tfa_enabled ? 'Enabled' : 'Disabled'}
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
      <div style={{ padding: `${Spacing.S8} ${Spacing.S0}` }}>
        <Box
          direction="row"
          style={{
            alignItems: 'center',
            gap: 24,
          }}
        >
          <p style={{ flex: 1, font: Typography.Heading.M }}>User Details</p>
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
      </div>
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
