import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import ExternalLink from 'src/components/ExternalLink';
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
        <ActionsPanel>
          <Button buttonType="secondary" data-qa-cancel onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onClose();
              handleSubmit();
            }}
            buttonType="primary"
          >
            Enable Object Storage
          </Button>
        </ActionsPanel>
      )}
      onClose={close}
      open={open}
      title="Just to confirm..."
    >
      <Typography variant="subtitle1">
        Linode Object Storage costs a flat rate of <strong>$5/month</strong>,
        and includes 250 GB of storage and 1 TB of outbound data transfer.
        Beyond that, it's <strong>$0.02 per GB per month.</strong>{' '}
        <ExternalLink
          fixedIcon
          link="https://www.linode.com/docs/platform/object-storage/pricing-and-limitations/"
          text="Learn more."
        />
      </Typography>
      <Typography style={{ marginTop: 8 }} variant="subtitle1">
        To discontinue billing, you'll need to cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(EnableObjectStorageModal);
