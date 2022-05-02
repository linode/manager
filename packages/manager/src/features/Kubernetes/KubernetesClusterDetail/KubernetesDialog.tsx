import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import TypeToConfirm from 'src/components/TypeToConfirm';
import Notice from 'src/components/Notice';
import { PoolNodeWithPrice } from 'src/features/Kubernetes/types';
import withPreferences, {
  Props as PreferencesProps,
} from 'src/containers/preferences.container';

interface Props {
  open: boolean;
  loading: boolean;
  clusterLabel: string;
  clusterPools: PoolNodeWithPrice[];
  error?: string;
  onClose: () => void;
  onDelete: () => void;
}

export type CombinedProps = Props & PreferencesProps;

const renderActions = (
  disabled: boolean,
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
        disabled={disabled}
        loading={loading}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Delete Cluster
      </Button>
    </ActionsPanel>
  );
};

export const getTotalLinodes = (pools: PoolNodeWithPrice[]) => {
  return pools.reduce((accum, thisPool) => {
    return accum + thisPool.count;
  }, 0);
};

export const KubernetesDialog: React.FC<CombinedProps> = (props) => {
  const {
    clusterLabel,
    clusterPools,
    error,
    loading,
    open,
    onClose,
    onDelete,
    preferences,
  } = props;
  const [confirmText, setConfirmText] = React.useState<string>('');
  const disabled =
    preferences?.type_to_confirm !== false && confirmText !== clusterLabel;
  const poolCount = clusterPools.length;
  const linodeCount = getTotalLinodes(clusterPools);

  return (
    <ConfirmationDialog
      open={open}
      title={`Delete Cluster ${clusterLabel}`}
      onClose={onClose}
      actions={() => renderActions(disabled, loading, onClose, onDelete)}
    >
      {error && <Notice error text={error} />}
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> This cluster contains {` `}
          <strong>
            {poolCount === 1 ? `1 node pool ` : `${poolCount} node pools `}
          </strong>
          with a total of {` `}
          <strong>
            {linodeCount === 1 ? `1 Linode ` : `${linodeCount} Linodes `}
          </strong>
          that will be deleted along with the cluster. Deleting a cluster is
          permanent and can&rsquo;t be undone.
        </Typography>
      </Notice>
      <TypeToConfirm
        label="Cluster Name"
        confirmationText={
          <span>
            To confirm deletion, type the name of the cluster (
            <b>{clusterLabel}</b>) in the field below:
          </span>
        }
        value={confirmText}
        typographyStyle={{ marginTop: '10px' }}
        data-testid={'dialog-confirm-text-input'}
        expand
        onChange={(input) => {
          setConfirmText(input);
        }}
        visible={preferences?.type_to_confirm}
      />
    </ConfirmationDialog>
  );
};

export default compose<CombinedProps, Props>(withPreferences())(
  KubernetesDialog
);
