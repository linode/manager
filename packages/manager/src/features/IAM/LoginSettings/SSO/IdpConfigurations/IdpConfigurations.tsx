import {
  Button,
  Icon,
  NotificationBanner,
  Tooltip,
} from '@akamai/cds-components/react';
import * as React from 'react';

import { usePermissions } from '../../../hooks/usePermissions';
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

export const IdpConfigurations = ({ idpConfig }: { idpConfig: IdpConfig }) => {
  const { data: permissions } = usePermissions('account', [
    'delete_idp_config',
    'update_idp_config',
    'create_idp_config_cert',
  ]);

  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isAddCertDrawerOpen, setIsAddCertDrawerOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const identityElementLabel =
    identityElementOptions.find(
      (opt) => opt.value === idpConfig.saml.identity_element
    )?.label ?? idpConfig.saml.identity_element;

  const isMaxCertificatesReached =
    idpConfig.saml.public_certificates.length >= 10;
  const certs = idpConfig.saml.public_certificates;

  const {
    activeCertificatesCount,
    activeOnlyCount,
    expiredCount,
    expiringCount,
  } = getCertificateCounts(certs);

  return (
    <>
      <Paper>
        <div className={styles.header}>
          <h3>Provider details</h3>
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
                onClick={() => setIsDeleteDialogOpen(true)}
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
                onClick={() => setIsEditDrawerOpen(true)}
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

        <h3 className={styles.sectionHeading}>Attribute Mapping</h3>

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
          <h3>SAML Certificates</h3>
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
              onClick={() => setIsAddCertDrawerOpen(true)}
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
          certificates={idpConfig.saml.public_certificates}
          idpConfigId={idpConfig.id}
          mode="landing"
          ssoEnabled={idpConfig.enabled}
        />
      </Paper>
      <IdpConfigurationDrawer
        idpConfig={idpConfig}
        mode="edit"
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
      />
      <AddCertificateDrawer
        existingCerts={idpConfig.saml.public_certificates}
        idpConfigId={idpConfig.id}
        onClose={() => setIsAddCertDrawerOpen(false)}
        open={isAddCertDrawerOpen}
      />
      <IDPConfigDeleteConfirmation
        idpConfigId={idpConfig.id}
        idpConfigLabel={idpConfig.label}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
    </>
  );
};
