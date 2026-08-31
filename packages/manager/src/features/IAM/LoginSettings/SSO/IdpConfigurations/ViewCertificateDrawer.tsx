import {
  Button,
  LoadingSpinner,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { truncateMiddle } from '@akamai/compute-ui-core/formatting';
import * as React from 'react';

import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { usePermissions } from '../../../hooks/usePermissions';
import { CopyTooltip } from '../../../Shared/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from '../../../Shared/DateTimeDisplay/DateTimeDisplay';
import { Drawer, DrawerInlineActions } from '../../../Shared/Drawer';
import { StatusIcon } from '../../../Shared/StatusIcon/StatusIcon';
import { IAM_SSO_IDP_PENDO_IDS } from '../../constants';
import { getCertificateStatus } from './idpConfigurationDrawer.utils';
import styles from './ViewCertificateDrawer.module.css';

import type { IdpCertificate } from '@linode/api-v4';

interface Props {
  cert: IdpCertificate | undefined;
  isCertLoading?: boolean;
  onClose: () => void;
  open: boolean;
}

export const ViewCertificateDrawer = ({
  cert,
  onClose,
  open,
  isCertLoading = false,
}: Props) => {
  const { data: permissions } = usePermissions('account', [
    'view_idp_config_certs',
  ]);

  const handleClose = () => {
    onClose();
  };
  const isSMUp = useBreakpoint('up', 'sm');

  return (
    <Drawer aria-label="View Details" onClose={handleClose} open={open}>
      <div slot="header">View Details</div>
      {isCertLoading ? (
        <div
          slot="body"
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: Spacing.S24,
          }}
        >
          <LoadingSpinner data-testid="circle-progress" size="medium" />
        </div>
      ) : !permissions?.view_idp_config_certs ? (
        <div slot="body">
          <NotificationBanner type="error">
            <p style={{ marginBottom: Spacing.S0 }}>
              You do not have permission to view this certificate.
            </p>
          </NotificationBanner>
        </div>
      ) : cert ? (
        <div className={styles.viewCertContainer}>
          <p>
            <strong>Created by:</strong> {cert.created_by}
          </p>
          <p>
            <strong>Created:</strong>{' '}
            <DateTimeDisplay displayTime={false} value={cert.created} />
          </p>
          <p>
            <strong>Valid From:</strong>{' '}
            <DateTimeDisplay displayTime={false} value={cert.not_before} />
          </p>
          <p>
            <strong>Expiration Date:</strong>{' '}
            <DateTimeDisplay displayTime={false} value={cert.not_after} />
          </p>
          <p className={styles.viewCertFlex}>
            <strong>Status:</strong>{' '}
            <span>
              {getCertificateStatus(cert.not_after, cert.not_before).text}
            </span>
            <StatusIcon
              pulse={false}
              status={
                getCertificateStatus(cert.not_after, cert.not_before).status
              }
              style={{
                width: '12px',
                height: '12px',
                marginLeft: Spacing.S2,
              }}
            />
          </p>
          <p className={styles.viewCertFlex}>
            <strong>ID:</strong> {cert.id}
            <CopyTooltip text={cert.id} />
          </p>
          <p className={styles.viewCertFlex}>
            <strong>Certificate:</strong>{' '}
            {isSMUp
              ? truncateMiddle(cert.certificate, 38)
              : truncateMiddle(cert.certificate, 30)}
            <CopyTooltip text={cert.certificate} />
          </p>
        </div>
      ) : (
        <div slot="body">
          <NotificationBanner type="error">
            <p style={{ marginBottom: Spacing.S0 }}>
              This certificate is no longer assigned or could not be found.
            </p>
          </NotificationBanner>
        </div>
      )}
      <DrawerInlineActions>
        <Button
          data-pendo-id={IAM_SSO_IDP_PENDO_IDS.viewDetailsCloseButton}
          onClick={handleClose}
          variant="secondary"
        >
          Close
        </Button>
      </DrawerInlineActions>
    </Drawer>
  );
};
