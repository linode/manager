import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { pluralize } from 'src/utilities/pluralize';

interface Props {
  open: boolean;
  nodeCount: number;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onDelete: () => void;
}

type CombinedProps = Props;

const renderActions = (
  loading: boolean,
  onClose: () => void,
  onDelete: () => void
) => {
  return (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="secondary"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onDelete}
        loading={loading}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Delete
      </Button>
    </ActionsPanel>
  );
};

const NodePoolDialog: React.FC<CombinedProps> = (props) => {
  const { error, loading, nodeCount, open, onClose, onDelete } = props;

  return (
    <ConfirmationDialog
      open={open}
      title={'Delete Node Pool?'}
      onClose={onClose}
      actions={() => renderActions(loading, onClose, onDelete)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        Are you sure you want to delete this Node Pool?{' '}
        {nodeCount > 0 &&
          `${pluralize('node', 'nodes', nodeCount)} will be deleted.`}
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(NodePoolDialog);
