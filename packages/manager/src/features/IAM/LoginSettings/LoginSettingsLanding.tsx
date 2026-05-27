import { Button } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { SSO_ENFORCEMENT_LINK } from '../Shared/constants';
import { Link } from '../Shared/Link/Link';
import { Paper } from '../Shared/Paper/Paper';
import { StatusIcon } from '../Shared/StatusIcon/StatusIcon';

export const LoginSettingsLanding = () => {
  const navigate = useNavigate();

  return (
    <Paper padding={Spacing.S24} paddingTop={Spacing.S24}>
      <h2
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S12,
          font: Typography.Heading.S,
        }}
      >
        Single Sign-On Enforcement
      </h2>
      <p style={{ margin: Spacing.S0 }}>
        The single sign-on (SSO) enforcement enables you to configure the SSO
        login for users of your account, including identity provider (IDP)
        configuration and excluded users.{' '}
        <Link to={SSO_ENFORCEMENT_LINK}>Learn more.</Link>
      </p>
      <div
        style={{
          padding: `${Spacing.S8} 0`,
          margin: `${Spacing.S16} 0`,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <StatusIcon status="active" />
        <p style={{ margin: Spacing.S0 }}>
          Disabled. SSO login is not configured for this account.
        </p>
      </div>
      <Button
        onClick={() =>
          navigate({ to: '/iam/login-settings/sso/idp-configurations' })
        }
        variant="secondary"
      >
        Manage SSO Enforcement
      </Button>
    </Paper>
  );
};
