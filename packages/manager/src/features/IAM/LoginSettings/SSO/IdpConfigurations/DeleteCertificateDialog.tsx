import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  LoadingSpinner,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDeleteIdpCertificateMutation } from '@linode/queries';
import * as React from 'react';

import { usePermissions } from '../../../hooks/usePermissions';
import { IAM_SSO_IDP_PENDO_IDS } from '../../constants';

import type { IdpCertificate } from '@linode/api-v4';

interface Props {
  certificate: IdpCertificate | undefined;
  idpConfigId: string;
  isCertLoading?: boolean;
  onClose: () => void;
  /** Clears remaining URL params after the exit animation finishes. */
  onExited?: () => void;
  open: boolean;
}

export const DeleteCertificateDialog = ({
  isCertLoading = false,
  certificate,
  idpConfigId,
  onClose: _onClose,
  onExited,
  open,
}: Props) => {
  const { data: permissions } = usePermissions('account', [
    'delete_idp_config_cert',
  ]);

  const {
    error,
    isPending,
    mutateAsync: deleteCertificate,
    reset,
  } = useDeleteIdpCertificateMutation(idpConfigId);

  // before-closed runs while Lit `_state === 'closing'`, when re-asserting
  // open=true is ignored — so the router can clear `open` during the exit animation.
  // Only clear `action` here so `role` stays available for the exit frame.
  const onClose = () => {
    _onClose();
  };

  const onModalClosed = () => {
    reset();
    onExited?.();
  };

  const handleDelete = async () => {
    try {
      await deleteCertificate({ id: certificate?.id ?? '' });
      toast.open({
        text: 'Certificate deleted successfully.',
        type: 'success',
      });
      onClose();
    } catch {
      // Error handled by mutation state
    }
  };

  const certificateMissing = !isCertLoading && !certificate;
  const canSubmit = Boolean(certificate) && !isCertLoading;

  return (
    <Modal
      onModalBeforeClosed={onClose}
      onModalClosed={onModalClosed}
      open={open}
      role="dialog"
      size={error || certificateMissing ? 'medium' : 'small'}
    >
      <span slot="title">Delete the certificate?</span>
      <div slot="body">
        {isCertLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: Spacing.S24,
            }}
          >
            <LoadingSpinner data-testid="circle-progress" size="medium" />
          </div>
        ) : certificateMissing ? (
          <NotificationBanner type="error">
            <p style={{ marginBottom: Spacing.S0 }}>
              The certificate could not be found.
            </p>
          </NotificationBanner>
        ) : (
          <>
            {!permissions?.delete_idp_config_cert && (
              <NotificationBanner
                style={{ marginBottom: Spacing.S8 }}
                text="You do not have permission to delete this certificate."
                type="error"
              />
            )}
            <p>
              You’re about to delete the certificate with the expiration date:{' '}
              <strong>{certificate?.not_after}</strong>. This action can’t be
              undone.
            </p>

            {error ? (
              <NotificationBanner
                style={{ marginTop: Spacing.S16 }}
                text={error[0].reason}
                type="error"
              />
            ) : undefined}
          </>
        )}
      </div>
      <div slot="actions">
        <Button
          data-pendo-id={IAM_SSO_IDP_PENDO_IDS.deleteCertificateCancel}
          onClick={onClose}
          variant="secondary"
        >
          {certificateMissing ? 'Close' : 'Cancel'}
        </Button>
        {!certificateMissing && !isCertLoading && (
          <Button
            data-pendo-id={IAM_SSO_IDP_PENDO_IDS.deleteCertificateEndFlow}
            disabled={!canSubmit || !permissions?.delete_idp_config_cert}
            onClick={handleDelete}
            processing={isPending}
            variant="primary"
          >
            Delete Certificate
          </Button>
        )}
      </div>
    </Modal>
  );
};