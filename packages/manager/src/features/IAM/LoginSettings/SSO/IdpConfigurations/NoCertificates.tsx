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
import * as React from 'react';

import { usePermissions } from '../../../hooks/usePermissions';
import {
  ADD_CERTIFICATE_PERMISSION_ERROR,
  IAM_SSO_IDP_PENDO_IDS,
} from '../../constants';
import { AddCertificateDrawer } from './AddCertificateDrawer';

interface Props {
  idpConfigId: string;
}

export const NoCertificates = ({ idpConfigId }: Props) => {
  const { data: permissions } = usePermissions('account', [
    'create_idp_config_cert',
  ]);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const onClick = () => setIsDrawerOpen(true);

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
              onClick={onClick}
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
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      />
    </>
  );
};
