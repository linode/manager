import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDeleteIdpCertificateMutation } from '@linode/queries';
import * as React from 'react';

import { IAM_SSO_IDP_PENDO_IDS } from '../../constants';

import type { IdpCertificate } from '@linode/api-v4';

interface Props {
  certificate: IdpCertificate | null;
  idpConfigId: string;
  onClose: () => void;
  open: boolean;
}

export const DeleteCertificateDialog = ({
  certificate,
  idpConfigId,
  onClose,
  open,
}: Props) => {
  const {
    error,
    isPending,
    mutateAsync: deleteCertificate,
    reset,
  } = useDeleteIdpCertificateMutation(idpConfigId);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDelete = async () => {
    try {
      await deleteCertificate({ id: certificate?.id ?? '' });
      toast.open({
        text: 'Certificate deleted successfully.',
        type: 'success',
      });
      handleClose();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <Modal
      onModalClosed={handleClose}
      open={open}
      role="dialog"
      size={error ? 'medium' : 'small'}
    >
      <span slot="title">Delete the certificate?</span>
      <div slot="body">
        {certificate && (
          <>
            <p>
              You’re about to delete the certificate with the expiration date:{' '}
              <strong>{certificate.not_after}</strong>. This action can’t be
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
          onClick={handleClose}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          data-pendo-id={IAM_SSO_IDP_PENDO_IDS.deleteCertificateEndFlow}
          disabled={isPending || !certificate}
          onClick={handleDelete}
          processing={isPending}
          variant="primary"
        >
          Delete Certificate
        </Button>
      </div>
    </Modal>
  );
};
