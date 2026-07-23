import {
  Button,
  Icon,
  TableCell,
  TableRow,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { truncateMiddle } from '@akamai/compute-ui-core/formatting';
import React from 'react';

import { useHasTableStripingEnabled } from '../../../hooks/useHasTableStripingEnabled';
import { usePermissions } from '../../../hooks/usePermissions';
import { CopyTooltip } from '../../../Shared/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from '../../../Shared/DateTimeDisplay/DateTimeDisplay';
import globalStyles from '../../../Shared/global.module.css';
import { StatusIcon } from '../../../Shared/StatusIcon/StatusIcon';
import {
  DELETE_PERMISSION_ERROR,
  IAM_SSO_IDP_PENDO_IDS,
  SSO_CANNOT_DELETE_LAST_CERTIFICATE,
  SSO_REQUIRES_ACTIVE_CERTIFICATE,
  VIEW_DETAILS_PERMISSION_ERROR,
} from '../../constants';
import styles from './CertificatesTable.module.css';

import type { Status } from '../../../Shared/StatusIcon/StatusIcon';
import type { IdpCertificate } from '@linode/api-v4';

interface CertificateTableLandingProps {
  activeCertificateCount?: null | number;
  cert: IdpCertificate;
  isMobileScreen: boolean;
  isSmallScreen: boolean;
  onDelete: (cert: IdpCertificate) => void;
  onViewDetails: (cert: IdpCertificate) => void;
  ssoEnabled?: boolean;
  status: Status;
  totalCertificateCount?: number;
}

export const CertificateTableLandingRow = ({
  cert,
  isSmallScreen,
  isMobileScreen,
  status,
  onDelete,
  onViewDetails,
  ssoEnabled,
  activeCertificateCount,
  totalCertificateCount,
}: CertificateTableLandingProps) => {
  const { data: permissions } = usePermissions('account', [
    'view_idp_config_certs',
    'delete_idp_config_cert',
  ]);
  const hasTableStripingEnabled = useHasTableStripingEnabled();

  const isSsoEnabled = !!ssoEnabled;
  const activeCount = activeCertificateCount ?? 0;
  const totalCount = totalCertificateCount ?? 0;

  const isCertValid = status !== 'error' && status !== 'inactive';

  // Deletion is disabled when:
  // - SSO is enabled and deleting this certificate would leave zero valid certificates (i.e.,
  //   this is the only non-expired certificate), OR
  // - the current user lacks permission to delete certificates.
  const canDelete = !!permissions?.delete_idp_config_cert;

  // Block deletion when SSO is enabled and deleting would leave zero valid certificates,
  // or when SSO is enabled and this is the only certificate at all.
  const blocksDueToOnlyTotal = isSsoEnabled && totalCount === 1;
  const blocksDueToOnlyValid = isSsoEnabled && activeCount === 1 && isCertValid;

  const ssoBlocksDelete = blocksDueToOnlyTotal || blocksDueToOnlyValid;

  const deleteDisabled = !canDelete || ssoBlocksDelete;

  return (
    <TableRow hoverable key={cert.id} rowborder zebra={hasTableStripingEnabled}>
      <TableCell className={styles.certCellLanding}>
        {truncateMiddle(
          cert.certificate,
          isSmallScreen ? (isMobileScreen ? 12 : 24) : 46
        )}
        <CopyTooltip
          pendoId={IAM_SSO_IDP_PENDO_IDS.copyCertificate}
          text={cert.certificate}
        />
      </TableCell>
      {!isMobileScreen && (
        <TableCell className={styles.expirationCell} hidden={isSmallScreen}>
          <StatusIcon
            pulse={false}
            status={status}
            style={{ marginRight: 0 }}
          />
          <DateTimeDisplay displayTime={false} value={cert.not_after} />
        </TableCell>
      )}

      <TableCell
        className={globalStyles.actionsCell}
        style={{ minWidth: '50px' }}
      >
        <Tooltip
          className={styles.actionButton}
          disabled={permissions?.view_idp_config_certs}
          tooltipPlacement="bottom"
          tooltipText={VIEW_DETAILS_PERMISSION_ERROR}
        >
          <Button
            data-pendo-id={IAM_SSO_IDP_PENDO_IDS.viewDetails}
            disabled={!permissions?.view_idp_config_certs}
            onClick={() => onViewDetails(cert)}
            style={{
              paddingRight: Spacing.S8,
            }}
            type="button"
            variant="link"
          >
            View Details
            {!permissions?.view_idp_config_certs && (
              <Icon icon="info-outline" size="s" />
            )}
          </Button>
        </Tooltip>
        <Tooltip
          className={styles.actionButton}
          disabled={!deleteDisabled}
          style={{ minWidth: '50px' }}
          tooltipPlacement="bottom"
          tooltipText={
            !canDelete
              ? DELETE_PERMISSION_ERROR
              : blocksDueToOnlyTotal
                ? SSO_CANNOT_DELETE_LAST_CERTIFICATE
                : SSO_REQUIRES_ACTIVE_CERTIFICATE
          }
        >
          <Button
            data-pendo-id={IAM_SSO_IDP_PENDO_IDS.deleteStartFlow}
            disabled={deleteDisabled}
            onClick={() => {
              if (!deleteDisabled) {
                onDelete(cert);
              }
            }}
            style={{
              paddingLeft: 'var(--token-global-spacing-s8, 8px)',
            }}
            type="button"
            variant="link"
          >
            Delete
          </Button>
          {deleteDisabled && (
            <Icon
              icon="info-outline"
              size="s"
              style={{ marginLeft: 'var(--token-global-spacing-s4, 4px)' }}
            />
          )}
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};
