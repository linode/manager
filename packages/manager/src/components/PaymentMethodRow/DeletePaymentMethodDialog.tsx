import * as React from 'react';
import ActionsPanel from '../ActionsPanel';
import Button from '../Button';
import Dialog from 'src/components/ConfirmationDialog';

interface Props {
  id: number;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  loading: boolean;
  error: string | undefined;
}

export const DeletePaymentMethodDialog: React.FC<Props> = (props) => {
  const { open, onClose, loading, onDelete, error } = props;

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        destructive
        onClick={onDelete}
        loading={loading}
        data-qa-confirm
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  return (
    <Dialog
      title="Delete Payment Method"
      error={error}
      open={open}
      onClose={onClose}
      actions={actions}
    >
      Are you sure you want to delete this payment method?
    </Dialog>
  );
};

export default React.memo(DeletePaymentMethodDialog);
