import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import TypeToConfirm from 'src/components/TypeToConfirm';
import Notice from 'src/components/Notice';
import { usePreferences } from 'src/queries/preferences';
import {
  useAllKubernetesNodePoolQuery,
  useDeleteKubernetesClusterMutation,
} from 'src/queries/kubernetes';
import { KubeNodePoolResponse } from '@linode/api-v4';
import CircleProgress from 'src/components/CircleProgress';
import { useHistory } from 'react-router-dom';

export interface Props {
  open: boolean;
  clusterLabel: string;
  clusterId: number;
  onClose: () => void;
}

export const getTotalLinodes = (pools: KubeNodePoolResponse[]) => {
  return pools.reduce((accum, thisPool) => {
    return accum + thisPool.count;
  }, 0);
};

export const DeleteKubernetesClusterDialog = (props: Props) => {
  const { clusterLabel, clusterId, open, onClose } = props;

  const { data: pools, isLoading } = useAllKubernetesNodePoolQuery(clusterId, {
    enabled: open,
  });

  const {
    mutateAsync: deleteCluster,
    isLoading: isDeleting,
    error,
  } = useDeleteKubernetesClusterMutation();

  const history = useHistory();
  const { data: preferences } = usePreferences();
  const [confirmText, setConfirmText] = React.useState<string>('');
  const disabled =
    preferences?.type_to_confirm !== false && confirmText !== clusterLabel;
  const poolCount = pools?.length;
  const linodeCount = getTotalLinodes(pools ?? []);

  const onDelete = () => {
    deleteCluster({ id: clusterId }).then(() => {
      onClose();
      history.replace('/kubernetes/clusters');
    });
  };

  const actions = (
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
        loading={isDeleting}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Delete Cluster
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={open}
      title={`Delete Cluster ${clusterLabel}`}
      onClose={onClose}
      actions={actions}
      error={error?.[0].reason}
    >
      {isLoading ? (
        <CircleProgress />
      ) : (
        <>
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
        </>
      )}
    </ConfirmationDialog>
  );
};
