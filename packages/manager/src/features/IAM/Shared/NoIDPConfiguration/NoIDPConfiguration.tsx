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
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import {
  IAM_SSO_ENFORCE_PENDO_IDS,
  IAM_SSO_IDP_PENDO_IDS,
} from '../../LoginSettings/constants';
import { IdpConfigurationDrawer } from '../../LoginSettings/SSO/IdpConfigurations/IdpConfigurationDrawer';
import { IAM_ACTIONS } from '../../routes';

import type { IAMAction } from '../../routes';

interface Props {
  permissions: Record<'create_idp_config', boolean> | undefined;
}

const IDP_CONFIGURATIONS_URL = '/iam/settings/sso/idp-configurations';
const SSO_ENFORCEMENT_URL = '/iam/settings/sso/enforcement-settings';

export const NoIDPConfiguration = ({ permissions }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { action } = useSearch({ strict: false }) as { action?: IAMAction };

  const isOnIDPConfigurationsPage = location.pathname.includes(
    '/idp-configurations'
  );

  const handleCreateIDPConfiguration = () => {
    actionHandler(IAM_ACTIONS.createConfig);
  };

  const actionHandler = (action: IAMAction) => {
    navigate({
      to: isOnIDPConfigurationsPage
        ? IDP_CONFIGURATIONS_URL
        : SSO_ENFORCEMENT_URL,
      search: (prev) => ({
        ...prev,
        action,
      }),
    });
  };

  const clearDialogAction = (expectedAction?: IAMAction) => {
    // Both overlays share the same `action` search param. Guard ensures a close
    // event from one overlay cannot wipe the other's URL state.
    if (expectedAction && action !== expectedAction) {
      return;
    }

    navigate({
      to: isOnIDPConfigurationsPage
        ? IDP_CONFIGURATIONS_URL
        : SSO_ENFORCEMENT_URL,
      search: (prev) => ({
        ...prev,
        action: undefined,
      }),
    });
  };

  return (
    <>
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
            disabled={permissions?.create_idp_config}
            tooltipPlacement="bottom"
            tooltipText="You do not have permission to create IDP configuration."
          >
            <Button
              data-pendo-id={
                isOnIDPConfigurationsPage
                  ? IAM_SSO_IDP_PENDO_IDS.createIDPConfigurationStartFlow
                  : IAM_SSO_ENFORCE_PENDO_IDS.createIDPConfigurationStartFlow
              }
              disabled={!permissions?.create_idp_config}
              onClick={handleCreateIDPConfiguration}
              variant="primary"
            >
              Create IDP Configuration
              {!permissions?.create_idp_config && (
                <Icon icon="info-outline" size="m" />
              )}
            </Button>
          </Tooltip>
        </ZeroErrorActions>
      </ZeroErrorState>
      <IdpConfigurationDrawer
        mode="create"
        onClose={() => clearDialogAction(IAM_ACTIONS.createConfig)}
        open={action === IAM_ACTIONS.createConfig}
      />
    </>
  );
};
