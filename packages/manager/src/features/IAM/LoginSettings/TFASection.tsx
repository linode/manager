import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { usePermissions } from '../hooks/usePermissions';
import { useTfaUserCounts } from '../hooks/useTfaUserCounts';
import { Box } from '../Shared/Box/Box';
import { TFA_ENFORCEMENT_LEARN_MORE_LINK } from '../Shared/constants';
import { ErrorState } from '../Shared/ErrorState/ErrorState';
import { Link } from '../Shared/Link/Link';
import { Paper } from '../Shared/Paper/Paper';
import { StatusIcon } from '../Shared/StatusIcon/StatusIcon';
import { IAM_SETTINGS_PENDO_IDS } from './constants';

import type { AccountSettings, APIError } from '@linode/api-v4';

interface Props {
  error: APIError[] | null;
  tfaSettings: AccountSettings | undefined;
}

export const TFASection = ({ error, tfaSettings }: Props) => {
  const navigate = useNavigate();

  // TODO: UIE-12176 Replace with the correct permissions once they are available in the API.
  const {
    data: permissions,
    error: permissionsError,
    isLoading: isPermissionsLoading,
  } = usePermissions('account', ['is_account_admin']);

  const isEnforced = tfaSettings?.tfa_enforced ?? false;
  const { enforcedUsersCount, totalUsers } = useTfaUserCounts(isEnforced);

  if (!permissions?.is_account_admin && !isPermissionsLoading) {
    return (
      <NotificationBanner
        text="You do not have permission to view 2FA enforcement settings."
        type="error"
      />
    );
  }
  if (permissionsError || (error && permissions?.is_account_admin)) {
    return (
      <Paper>
        <ErrorState />
      </Paper>
    );
  }

  return (
    <Paper padding={Spacing.S24} paddingTop={Spacing.S24}>
      <h2
        style={{
          marginBottom: Spacing.S12,
          font: Typography.Heading.S,
        }}
      >
        Enforce Two-Factor Authentication (2FA)
      </h2>
      <p>
        Secure your account by enforcing two-step login. Choose whether to apply
        this requirement globally to all users or target specific individuals.{' '}
        <Link to={TFA_ENFORCEMENT_LEARN_MORE_LINK}>Learn more.</Link>
      </p>
      <Box
        direction="row"
        style={{
          margin: `${Spacing.S16} 0`,
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}
      >
        <StatusIcon status={isEnforced ? 'active' : 'inactive'} />
        <p>
          {isEnforced ? (
            <>
              Enforced. {enforcedUsersCount} of {totalUsers} users are required
              to use 2FA to log in.
            </>
          ) : (
            'Not enforced. 2FA is optional for all users on this account.'
          )}
        </p>
      </Box>
      <Button
        data-pendo-id={IAM_SETTINGS_PENDO_IDS.manageTFAEnforcement}
        onClick={() => navigate({ to: '/iam/settings/tfa-enforcement' })}
        variant="secondary"
      >
        Manage 2FA Enforcement
      </Button>
    </Paper>
  );
};
