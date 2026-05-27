import {
  Button,
  Icon,
  Tooltip,
  ZeroErrorActions,
  ZeroErrorDescription,
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

interface Props {
  permissions: Record<'is_account_admin', boolean> | undefined;
}

export const NoIDPConfiguration = ({ permissions }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isOnIDPConfigurationsPage = location.pathname.includes(
    '/idp-configurations'
  );

  const onClick = () => {
    if (!isOnIDPConfigurationsPage) {
      navigate({ to: '/iam/login-settings/sso/idp-configurations' });
    }
    // open a drawer to create IDP configuration
  };

  return (
    <ZeroErrorState>
      <ZeroErrorIcon icon="doc-no-selection" />
      <ZeroErrorTitle>No data to display</ZeroErrorTitle>
      <ZeroErrorDescription
        style={{ maxWidth: isOnIDPConfigurationsPage ? 260 : 320 }}
      >
        {`Once you create the IDP configuration, ${isOnIDPConfigurationsPage ? 'it will show up here.' : 'you’ll be able to manage its enforcement here.'}`}
      </ZeroErrorDescription>
      <ZeroErrorActions>
        <Tooltip
          disabled={permissions?.is_account_admin}
          tooltipPlacement="bottom"
          tooltipText="You do not have permission to create IDP configuration."
        >
          <Button
            disabled={!permissions?.is_account_admin}
            onClick={onClick}
            variant="primary"
          >
            Create IDP Configuration
            {!permissions?.is_account_admin && (
              <Icon icon="info-outline" size="m" />
            )}
          </Button>
        </Tooltip>
      </ZeroErrorActions>
    </ZeroErrorState>
  );
};
