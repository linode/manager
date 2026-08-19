import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { usePermissions } from '../hooks/usePermissions';
import { Box } from '../Shared/Box/Box';
import {
  SSO_ENFORCEMENT_LINK,
  SSO_RECOMMENDATIONS_LINK,
} from '../Shared/constants';
import { ErrorState } from '../Shared/ErrorState/ErrorState';
import { Link } from '../Shared/Link/Link';
import { Paper } from '../Shared/Paper/Paper';
import { StatusIcon } from '../Shared/StatusIcon/StatusIcon';
import {
  IAM_SETTINGS_PENDO_IDS,
  SSO_EXPIRED_ENFORCED,
  SSO_EXPIRING,
} from './constants';
import { getCertificateCounts, getSummaryStatus } from './SSO/utilities';

import type { APIError, IdpConfig, ResourcePage } from '@linode/api-v4';

interface Props {
  error: APIError[] | null;
  idpConfigs: ResourcePage<IdpConfig> | undefined;
}

export const SSOSection = ({ error, idpConfigs }: Props) => {
  const navigate = useNavigate();

  const {
    data: permissions,
    error: permissionsError,
    isLoading: isPermissionsLoading,
  } = usePermissions('account', ['view_idp_config']);

  const idpConfig =
    idpConfigs && idpConfigs?.results > 0 ? idpConfigs.data[0] : null;

  const getStatus = (idpConfig: IdpConfig | null) => {
    if (!idpConfig || (idpConfig && !idpConfig.enabled)) {
      return 'inactive';
    }
    return 'active';
  };

  const isEnforcedForAllUsers =
    idpConfig?.enabled &&
    idpConfig.enforce &&
    idpConfig.excluded_users_count === 0;

  const certs = idpConfig?.saml?.public_certificates ?? [];
  const {
    activeOnlyCount,
    activeCertificatesCount,
    expiredCount,
    expiringCount,
  } = getCertificateCounts(certs);
  const hasCertExpiringWarning =
    idpConfig?.enabled && activeOnlyCount === 0 && expiringCount > 0;
  const hasCertExpiredError =
    idpConfig?.enabled && expiredCount > 0 && activeCertificatesCount === 0;

  if (!permissions?.view_idp_config && !isPermissionsLoading) {
    return (
      <NotificationBanner
        text="You do not have permission to view IDP configurations."
        type="error"
      />
    );
  }

  if (permissionsError || (error && permissions?.view_idp_config)) {
    return <ErrorState withPaper />;
  }

  return (
    <Paper padding={Spacing.S24} paddingTop={Spacing.S24}>
      <h2
        style={{
          marginBottom: Spacing.S12,
          font: Typography.Heading.S,
        }}
      >
        Enforce Single Sign-On
      </h2>
      <p>
        Configure your identity provider (IDP), single sign-on (SSO) login
        requirements for your account, and users you want to exclude from SSO
        enforcement.{' '}
        <Link
          pendoId={IAM_SETTINGS_PENDO_IDS.learnMore}
          to={SSO_ENFORCEMENT_LINK}
        >
          Learn more.
        </Link>
      </p>
      <Box
        direction="row"
        style={{
          margin: `${Spacing.S16} 0`,
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}
      >
        <StatusIcon status={getStatus(idpConfig)} />
        <p>{getSummaryStatus(idpConfig)}</p>
      </Box>
      {isEnforcedForAllUsers && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          type="warning"
        >
          There are no SSO user exceptions. Not recommended.{' '}
          <Link
            pendoId={IAM_SETTINGS_PENDO_IDS.learnMore}
            to={SSO_RECOMMENDATIONS_LINK}
          >
            Learn more.
          </Link>
        </NotificationBanner>
      )}
      {hasCertExpiredError && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={SSO_EXPIRED_ENFORCED}
          type="error"
        />
      )}
      {hasCertExpiringWarning && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={SSO_EXPIRING}
          type="warning"
        />
      )}
      <Button
        data-pendo-id={IAM_SETTINGS_PENDO_IDS.manageSSOEnforcement}
        onClick={() => navigate({ to: '/iam/settings/sso/idp-configurations' })}
        variant="secondary"
      >
        Manage SSO Enforcement
      </Button>
    </Paper>
  );
};
