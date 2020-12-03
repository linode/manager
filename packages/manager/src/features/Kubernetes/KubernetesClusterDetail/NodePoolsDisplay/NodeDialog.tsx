import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

interface Props {
  open: boolean;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onDelete: () => void;
  label?: string;
}

const renderActions = (
  loading: boolean,
  onClose: () => void,
  onDelete: () => void
) => {
  return (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="cancel"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        destructive
        loading={loading}
        onClick={onDelete}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Recycle
      </Button>
    </ActionsPanel>
  );
};

const NodeDialog: React.FC<Props> = props => {
  const { error, loading, open, onClose, onDelete, label } = props;

  return (
    <ConfirmationDialog
      open={open}
      title={`Recycle ${label ? label : 'this Node'}?`}
      onClose={onClose}
      actions={() => renderActions(loading, onClose, onDelete)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        Are you sure you want to recycle this Node? The Linode will be deleted
        and its data will be lost. A new Linode we be created to take its place.
        It may take up to 30 minutes for the recycled Node to come back online.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(NodeDialog);
