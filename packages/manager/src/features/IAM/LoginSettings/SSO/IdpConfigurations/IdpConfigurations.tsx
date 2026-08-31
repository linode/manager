import {
  Button,
  Icon,
  NotificationBanner,
  Tooltip,
} from '@akamai/cds-components/react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { usePermissions } from '../../../hooks/usePermissions';
import { IAM_ACTIONS, type IAMAction } from '../../../routes';
import { CopyTooltip } from '../../../Shared/CopyTooltip/CopyTooltip';
import { Paper } from '../../../Shared/Paper/Paper';
import {
  ADD_CERTIFICATE_PERMISSION_ERROR,
  IAM_SSO_IDP_PENDO_IDS,
  MAX_CERTIFICATES_REACHED_ERROR,
  METADATA_HREF,
  SSO_EXPIRED_ENFORCED,
  SSO_EXPIRING,
  SSO_REQUIRES_ACTIVE_CERTIFICATE,
} from '../../constants';
import { getCertificateCounts } from '../../SSO/utilities';
import { AddCertificateDrawer } from './AddCertificateDrawer';
import { CertificatesTable } from './CertificatesTable';
import { IDPConfigDeleteConfirmation } from './IDPConfigDeleteConfirmation';
import { IdpConfigurationDrawer } from './IdpConfigurationDrawer';
import { identityElementOptions } from './idpConfigurationDrawer.utils';
import styles from './IdpConfigurations.module.css';

import type { IdpConfig } from '@linode/api-v4';

const IDP_CONFIGURATIONS_ROUTE = '/iam/settings/sso/idp-configurations';

interface Props {
  idpConfig: IdpConfig;
  isIDPConfigLoading?: boolean;
}

export const IdpConfigurations = ({ idpConfig, isIDPConfigLoading }: Props) => {
  const { data: permissions } = usePermissions('account', [
    'delete_idp_config',
    'update_idp_config',
    'create_idp_config_cert',
  ]);

  const navigate = useNavigate();
  const { action, configurationID } = useSearch({
    from: IDP_CONFIGURATIONS_ROUTE,
  });

  const selectedIdpConfig = React.useMemo(
    () =>
      configurationID && configurationID === idpConfig?.id
        ? idpConfig
        : undefined,
    [configurationID, idpConfig]
  );

  const identityElementLabel =
    identityElementOptions.find(
      (opt) => opt.value === idpConfig.saml.identity_element
    )?.label ?? idpConfig.saml.identity_element;

  const certs = idpConfig.saml.public_certificates;
  const isMaxCertificatesReached = certs.length >= 10;

  const {
    activeCertificatesCount,
    activeOnlyCount,
    expiredCount,
    expiringCount,
  } = getCertificateCounts(certs);

  const actionHandler = (action: IAMAction) => {
    navigate({
      to: IDP_CONFIGURATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        action,
        configurationID: idpConfig.id,
      }),
    });
  };

  const handleAddCertificate = () => {
    actionHandler(IAM_ACTIONS.addCertificate);
  };

  const handleEditConfig = () => {
    actionHandler(IAM_ACTIONS.editConfig);
  };

  const handleDeleteConfig = () => {
    actionHandler(IAM_ACTIONS.deleteConfig);
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
        configurationID: undefined,
      }),
    });
  };

  const clearDialogAction = (expectedAction?: IAMAction) => {
    // Both overlays share the same `action` search param. Guard ensures a close
    // event from one overlay cannot wipe the other's URL state.
    if (expectedAction && action !== expectedAction) {
      return;
    }

    // Only clear `action` here so modal bodies keep `idpConfig` during the
    // exit animation. Remaining params are cleared in `clearDialogParams`.
    navigate({
      to: IDP_CONFIGURATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        action: undefined,
      }),
    });
  };

  const clearDialogParams = () => {
    navigate({
      to: IDP_CONFIGURATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        configurationID: undefined,
      }),
    });
  };

  return (
    <>
      <Paper>
        <div className={styles.header}>
          <div
            className={styles.sectionHeading}
            style={{ marginTop: 0, marginBottom: 0 }}
          >
            Provider details
          </div>
          <div className={styles.headerActions}>
            <Tooltip
              disabled={permissions?.delete_idp_config}
              tooltipPlacement="bottom"
              tooltipText="You do not have permission to delete this IDP configuration."
            >
              <Button
                data-pendo-id={
                  IAM_SSO_IDP_PENDO_IDS.deleteIDPConfigurationStartFlow
                }
                disabled={!permissions?.delete_idp_config}
                onClick={handleDeleteConfig}
                type="button"
                variant="link"
              >
                Delete IDP Configuration
                {!permissions?.delete_idp_config ? (
                  <Icon icon="info-outline" size="m" />
                ) : null}
              </Button>
            </Tooltip>
            <Tooltip
              disabled={permissions?.update_idp_config}
              tooltipText="You do not have permission to edit this IDP configuration."
            >
              <Button
                data-pendo-id={IAM_SSO_IDP_PENDO_IDS.editIDPConfiguration}
                disabled={!permissions?.update_idp_config}
                onClick={handleEditConfig}
                type="button"
                variant="primary"
              >
                Edit IDP Configuration
                {!permissions?.update_idp_config ? (
                  <Icon icon="info-outline" size="m" />
                ) : null}
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className={styles.detailRow}>
          <p className={styles.detailLabel}>Label:</p>
          <p className={styles.detailValue}>{idpConfig.label}</p>
        </div>

        <div className={styles.detailRow}>
          <p className={styles.detailLabel}>Entity ID:</p>
          <p className={styles.detailValue}>{idpConfig.saml.entity_id}</p>
          <CopyTooltip
            pendoId={IAM_SSO_IDP_PENDO_IDS.copyEntityID}
            text={idpConfig.saml.entity_id}
          />
        </div>

        <div className={styles.detailRow}>
          <p className={styles.detailLabel}>IDP URL:</p>
          <p className={styles.detailValue}>{idpConfig.saml.idp_url}</p>
          <CopyTooltip
            pendoId={IAM_SSO_IDP_PENDO_IDS.copyIDPURL}
            text={idpConfig.saml.idp_url}
          />
        </div>

        <div className={styles.metadataLink}>
          <Button
            data-pendo-id={IAM_SSO_IDP_PENDO_IDS.showSPMetadata}
            onClick={() => {
              window.open(METADATA_HREF, '_blank', 'noopener,noreferrer');
            }}
            size="small"
            type="button"
            variant="link"
          >
            Show SP Metadata <Icon icon="external-link" size="xs" />
          </Button>
        </div>

        <div className={styles.sectionHeading}>Attribute Mapping</div>

        <div className={styles.detailRow}>
          <p className={styles.detailLabel}>Identity Element:</p>
          <p className={styles.detailValue}>{identityElementLabel}</p>
        </div>

        {idpConfig.saml.identity_element === 'user_id_attribute' &&
          idpConfig.saml.user_id_attribute && (
            <div className={styles.detailRow}>
              <p className={styles.detailLabel}>Attribute Name:</p>
              <p className={styles.detailValue}>
                {idpConfig.saml.user_id_attribute}
              </p>
            </div>
          )}

        <div className={styles.certsHeader}>
          <div className={styles.sectionHeading}>SAML Certificates</div>
          <Tooltip
            disabled={
              !(
                isMaxCertificatesReached || !permissions?.create_idp_config_cert
              )
            }
            tooltipPlacement="bottom"
            tooltipText={
              isMaxCertificatesReached
                ? MAX_CERTIFICATES_REACHED_ERROR
                : !permissions?.create_idp_config_cert
                  ? ADD_CERTIFICATE_PERMISSION_ERROR
                  : undefined
            }
          >
            <Button
              data-pendo-id={IAM_SSO_IDP_PENDO_IDS.addCertificate}
              disabled={
                isMaxCertificatesReached || !permissions?.create_idp_config_cert
              }
              onClick={() => handleAddCertificate()}
              type="button"
              variant="secondary"
            >
              Add Certificate
              {(isMaxCertificatesReached ||
                !permissions?.create_idp_config_cert) && (
                <Icon icon="info-outline" size="s" />
              )}
            </Button>
          </Tooltip>
        </div>
        {idpConfig.enabled && activeOnlyCount === 0 && (
          <NotificationBanner
            style={{ marginBottom: 'var(--token-global-spacing-s16, 16px)' }}
            text={
              // Red only when all certs are expired
              expiredCount > 0 && expiredCount === certs.length
                ? SSO_EXPIRED_ENFORCED
                : // Yellow when there are expiring certs but no active
                  expiringCount > 0
                  ? SSO_EXPIRING
                  : SSO_REQUIRES_ACTIVE_CERTIFICATE
            }
            type={
              expiredCount > 0 && expiredCount === certs.length
                ? 'error'
                : 'warning'
            }
          />
        )}

        <CertificatesTable
          activeCertificateCount={activeCertificatesCount}
          certificates={certs}
          idpConfigId={idpConfig.id}
          isCertLoading={isIDPConfigLoading}
          mode="landing"
          ssoEnabled={idpConfig.enabled}
        />
      </Paper>
      <IdpConfigurationDrawer
        idpConfig={selectedIdpConfig}
        isIdpConfigLoading={isIDPConfigLoading}
        mode="edit"
        onClose={() => closeDrawer(IAM_ACTIONS.editConfig)}
        open={action === IAM_ACTIONS.editConfig}
      />
      <AddCertificateDrawer
        existingCerts={certs}
        idpConfigId={selectedIdpConfig?.id ?? ''}
        isIdpConfigLoading={isIDPConfigLoading}
        onClose={() => closeDrawer(IAM_ACTIONS.addCertificate)}
        open={action === IAM_ACTIONS.addCertificate}
      />
      <IDPConfigDeleteConfirmation
        idpConfigId={selectedIdpConfig?.id ?? ''}
        idpConfigLabel={selectedIdpConfig?.label ?? ''}
        isIdpConfigLoading={isIDPConfigLoading}
        onClose={() => clearDialogAction(IAM_ACTIONS.deleteConfig)}
        onExited={clearDialogParams}
        open={action === IAM_ACTIONS.deleteConfig}
      />
    </>
  );
};
