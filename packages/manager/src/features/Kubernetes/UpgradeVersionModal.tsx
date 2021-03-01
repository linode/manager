import { recycleClusterNodes } from '@linode/api-v4/lib/kubernetes';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import useKubernetesClusters from 'src/hooks/useKubernetesClusters';

interface DialogProps {
  clusterID: number;
  clusterLabel: string;
  isOpen: boolean;
  currentVersion: string;
  nextVersion: string | null;
  onClose: () => void;
}

export const UpgradeDialog: React.FC<DialogProps> = (props) => {
  const {
    clusterID,
    clusterLabel,
    currentVersion,
    nextVersion,
    isOpen,
    onClose,
  } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { updateKubernetesCluster } = useKubernetesClusters();

  const [hasUpdatedSuccessfully, setHasUpdatedSuccessfully] = React.useState(
    false
  );

  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setError(undefined);
      setSubmitting(false);
      setHasUpdatedSuccessfully(false);
    }
  }, [isOpen]);

  if (nextVersion === null) {
    return null;
  }

  const onSubmitUpgradeDialog = () => {
    setSubmitting(true);
    setError(undefined);
    updateKubernetesCluster(clusterID, {
      k8s_version: nextVersion,
    })
      .then((_) => {
        setHasUpdatedSuccessfully(true);
        setSubmitting(false);
      })
      .catch((e) => {
        setSubmitting(false);
        setError(e[0].reason);
      });
  };

  const onSubmitRecycleDialog = () => {
    setSubmitting(true);
    setError(undefined);
    recycleClusterNodes(clusterID)
      .then((_) => {
        enqueueSnackbar('Recycle started successfully.', {
          variant: 'success',
        });
        onClose();
      })
      .catch((e) => {
        setSubmitting(false);
        setError(e[0].reason);
      });
  };

  const dialogTitle = hasUpdatedSuccessfully
    ? `Step 2: Recycle All Cluster Nodes`
    : `Step 1: Upgrade ${clusterLabel} to Kubernetes ${nextVersion}`;

  const actions = hasUpdatedSuccessfully ? (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        destructive
        onClick={onSubmitRecycleDialog}
        loading={submitting}
        data-qa-confirm
      >
        Recycle All Nodes
      </Button>
    </ActionsPanel>
  ) : (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        destructive
        onClick={onSubmitUpgradeDialog}
        loading={submitting}
        data-qa-confirm
      >
        Upgrade Version
      </Button>
    </ActionsPanel>
  );

  return (
    <Dialog
      title={dialogTitle}
      error={error}
      open={isOpen}
      onClose={onClose}
      actions={actions}
    >
      {hasUpdatedSuccessfully ? (
        <>
          Kubernetes version has been updated successfully. For the changes to
          take full effect you must recycle the nodes in your cluster.
        </>
      ) : (
        <>
          Upgrade {clusterLabel}&apos;s Kubernetes version from{' '}
          <strong>{currentVersion}</strong> to <strong>{nextVersion}</strong>?
          Once the upgrade is complete you will need to recycle all nodes in
          your cluster.
        </>
      )}
    </Dialog>
  );
};

export default React.memo(UpgradeDialog);
