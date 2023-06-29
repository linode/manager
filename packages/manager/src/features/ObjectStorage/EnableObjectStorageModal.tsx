import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import { Link } from 'src/components/Link';

export interface Props {
  open: boolean;
  onClose: () => void;
  handleSubmit: () => void;
}

export const EnableObjectStorageModal = ({
  open,
  onClose,
  handleSubmit,
}: Props) => {
  return (
    <ConfirmationDialog
      open={open}
      onClose={close}
      title="Just to confirm..."
      actions={() => (
        <ActionsPanel
          primary
          primaryButtonHandler={() => {
            onClose();
            handleSubmit();
          }}
          primaryButtonText="Enable Object Storage"
          secondary
          secondaryButtonDataTestId="cancel"
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      )}
    >
      <Typography variant="subtitle1">
        Linode Object Storage costs a flat rate of <strong>$5/month</strong>,
        and includes 250 GB of storage and 1 TB of outbound data transfer.
        Beyond that, it's <strong>$0.02 per GB per month.</strong>{' '}
        <ExternalLink
          fixedIcon
          text="Learn more."
          link="https://www.linode.com/docs/platform/object-storage/pricing-and-limitations/"
        />
      </Typography>
      <Typography variant="subtitle1" style={{ marginTop: 8 }}>
        To discontinue billing, you'll need to cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(EnableObjectStorageModal);
