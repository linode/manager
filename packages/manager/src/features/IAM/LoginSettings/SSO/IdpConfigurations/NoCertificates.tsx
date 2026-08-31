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
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { usePermissions } from '../../../hooks/usePermissions';
import {
  ADD_CERTIFICATE_PERMISSION_ERROR,
  IAM_SSO_IDP_PENDO_IDS,
} from '../../constants';
import { AddCertificateDrawer } from './AddCertificateDrawer';

import type { IAMAction } from '../../../routes';

interface Props {
  idpConfigId: string;
}

const ADD_CERTIFICATE_ACTION: IAMAction = 'add-certificate';
const IDP_CONFIGURATIONS_ROUTE = '/iam/settings/sso/idp-configurations';

export const NoCertificates = ({ idpConfigId }: Props) => {
  const { data: permissions } = usePermissions('account', [
    'create_idp_config_cert',
  ]);

  const navigate = useNavigate();
  const { action } = useSearch({
    from: IDP_CONFIGURATIONS_ROUTE,
  });

  const actionHandler = (action: IAMAction) => {
    navigate({
      to: IDP_CONFIGURATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        action,
      }),
    });
  };

  const handleAddCertificate = () => {
    actionHandler(ADD_CERTIFICATE_ACTION);
  };

  const closeDrawer = (expectedAction: IAMAction) => {
    if (expectedAction && action !== expectedAction) {
      return;
    }

    navigate({
      to: IDP_CONFIGURATIONS_ROUTE,
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
        <ZeroErrorTitle>This list is empty</ZeroErrorTitle>
        <ZeroErrorDescription style={{ maxWidth: 320 }}>
          {`There are no certificates added yet. Once you add one, it will show up here.`}
        </ZeroErrorDescription>
        <ZeroErrorActions>
          <Tooltip
            disabled={permissions?.create_idp_config_cert}
            tooltipPlacement="bottom"
            tooltipText={ADD_CERTIFICATE_PERMISSION_ERROR}
          >
            <Button
              data-pendo-id={
                IAM_SSO_IDP_PENDO_IDS.addCertificateWhenSSODisabled
              }
              disabled={!permissions?.create_idp_config_cert}
              onClick={handleAddCertificate}
              variant="primary"
            >
              Add Certificate
              {!permissions?.create_idp_config_cert && (
                <Icon icon="info-outline" size="m" />
              )}
            </Button>
          </Tooltip>
        </ZeroErrorActions>
      </ZeroErrorState>

      <AddCertificateDrawer
        idpConfigId={idpConfigId}
        onClose={() => closeDrawer(ADD_CERTIFICATE_ACTION)}
        open={action === ADD_CERTIFICATE_ACTION}
      />
    </>
  );
};
