import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

export interface Props {
  handleSubmit: () => void;
  onClose: () => void;
  open: boolean;
}

export const EnableObjectStorageModal = ({
  handleSubmit,
  onClose,
  open,
}: Props) => {
  return (
    <ConfirmationDialog
      actions={() => (
        <ActionsPanel
          primaryButtonProps={{
            label: 'Enable Object Storage',
            onClick: () => {
              onClose();
              handleSubmit();
            },
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      )}
      onClose={onClose}
      open={open}
      title="Just to confirm..."
    >
      <Typography variant="subtitle1">
        Linode Object Storage costs a flat rate of <strong>$5/month</strong>,
        and includes 250 GB of storage and 1 TB of outbound data transfer.
        Beyond that, it's <strong>$0.02 per GB per month.</strong>{' '}
        <Link to="https://www.linode.com/docs/platform/object-storage/pricing-and-limitations/">
          Learn more.
        </Link>
      </Typography>
      <Typography style={{ marginTop: 8 }} variant="subtitle1">
        To discontinue billing, you'll need to cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(EnableObjectStorageModal);
