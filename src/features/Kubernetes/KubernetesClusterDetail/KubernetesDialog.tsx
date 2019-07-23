import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { PoolNodeWithPrice } from 'src/features/Kubernetes/types';

interface Props {
  open: boolean;
  loading: boolean;
  clusterLabel: string;
  clusterPools: PoolNodeWithPrice[];
  error?: string;
  onClose: () => void;
  onDelete: () => void;
}

type CombinedProps = Props;

const renderActions = (
  disabled: boolean,
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
        buttonType="secondary"
        disabled={disabled}
        destructive
        loading={loading}
        onClick={onDelete}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Delete
      </Button>
    </ActionsPanel>
  );
};

export const getTotalLinodes = (pools: PoolNodeWithPrice[]) => {
  return pools.reduce((accum, thisPool) => {
    return accum + thisPool.count;
  }, 0);
};

const KubernetesDialog: React.FC<CombinedProps> = props => {
  const {
    clusterLabel,
    clusterPools,
    error,
    loading,
    open,
    onClose,
    onDelete
  } = props;
  const [confirmText, setConfirmText] = React.useState<string>('');
  const disabled = confirmText !== clusterLabel;
  const poolCount = clusterPools.length;
  const linodeCount = getTotalLinodes(clusterPools);

  return (
    <ConfirmationDialog
      open={open}
      title={`Delete ${clusterLabel}`}
      onClose={onClose}
      actions={() => renderActions(disabled, loading, onClose, onDelete)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        This cluster contains {` `}
        <strong>
          {poolCount === 1 ? `1 node pool ` : `${poolCount} node pools `}
        </strong>
        with a total of {` `}
        <strong>
          {linodeCount === 1 ? `1 Linode ` : `${linodeCount} Linodes `}
        </strong>
        that will be deleted along with the cluster. Deleting a cluster is
        permanent and can't be undone.
      </Typography>
      <Typography style={{ marginTop: '10px' }}>
        To confirm deletion, type the name of the cluster ({clusterLabel}) in
        the field below:
      </Typography>
      <TextField
        data-testid={'dialog-confirm-text-input'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmText(e.target.value)
        }
        expand
      />
    </ConfirmationDialog>
  );
};

export default KubernetesDialog;
