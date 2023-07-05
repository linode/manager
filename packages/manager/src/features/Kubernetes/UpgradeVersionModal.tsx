import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { recycleClusterNodes } from '@linode/api-v4/lib/kubernetes';
import { useSnackbar } from 'notistack';
import {
  useKubernetesClusterMutation,
  useKubernetesVersionQuery,
} from 'src/queries/kubernetes';
import {
  getNextVersion,
  localStorageWarning,
} from 'src/features/Kubernetes/kubeUtils';

interface Props {
  clusterID: number;
  clusterLabel: string;
  isOpen: boolean;
  currentVersion: string;
  onClose: () => void;
}

export const UpgradeDialog = (props: Props) => {
  const { clusterID, clusterLabel, currentVersion, isOpen, onClose } = props;

  const { data: versions } = useKubernetesVersionQuery();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    clusterID
  );

  const nextVersion = getNextVersion(currentVersion, versions ?? []);

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
    updateKubernetesCluster({
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
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onSubmitRecycleDialog}
        loading={submitting}
        data-qa-confirm
      >
        Recycle All Nodes
      </Button>
    </ActionsPanel>
  ) : (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onSubmitUpgradeDialog}
        loading={submitting}
        data-qa-confirm
      >
        Upgrade Version
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title={dialogTitle}
      error={error}
      open={isOpen}
      onClose={onClose}
      actions={actions}
    >
      <Typography>
        {hasUpdatedSuccessfully ? (
          <>
            Kubernetes version has been updated successfully. <br /> <br />
            For the changes to take full effect you must recycle the nodes in
            your cluster. {localStorageWarning}
          </>
        ) : (
          <>
            Upgrade {clusterLabel}&rsquo;s Kubernetes version from{' '}
            <strong>{currentVersion}</strong> to <strong>{nextVersion}</strong>?
            Once the upgrade is complete you will need to recycle all nodes in
            your cluster.
          </>
        )}
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(UpgradeDialog);
