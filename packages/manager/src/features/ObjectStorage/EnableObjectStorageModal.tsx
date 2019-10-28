import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';

interface Props {
  open: boolean;
  onClose: () => void;
  handleSubmit: () => void;
}

const EnableObjectStorageModal: React.FC<Props> = ({
  open,
  onClose,
  handleSubmit
}) => {
  return (
    <ConfirmationDialog
      open={open}
      onClose={close}
      title="Just to confirm..."
      actions={() => (
        <ActionsPanel>
          <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={() => {
              onClose();
              handleSubmit();
            }}
          >
            Enable Object Storage
          </Button>
        </ActionsPanel>
      )}
    >
      <Typography variant="subtitle1">
        Linode Object Storage has a prorated minimum monthly cost of{' '}
        <strong>$5</strong>, which provides <strong>250 GB</strong> of storage.
        Object Storage adds <strong>1 TB</strong> of outbound data transfer to
        your data transfer pool.{' '}
        <ExternalLink
          fixedIcon
          text="Learn more."
          link="https://www.linode.com/docs/platform/object-storage/pricing-and-limitations/"
        />
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(EnableObjectStorageModal);
