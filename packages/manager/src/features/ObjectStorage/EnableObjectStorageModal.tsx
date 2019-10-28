import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

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
      title="Enable Object Storage"
      actions={() => (
        <ActionsPanel>
          <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="secondary"
            destructive
            onClick={() => {
              onClose();
              handleSubmit();
            }}
          >
            Enable
          </Button>
        </ActionsPanel>
      )}
    >
      Do you want to enable Object Storage?
    </ConfirmationDialog>
  );
};

export default React.memo(EnableObjectStorageModal);
