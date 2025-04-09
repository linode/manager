import { recycleClusterNodes } from '@linode/api-v4/lib/kubernetes';
import { ActionsPanel, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import {
  getNextVersion,
  useLkeStandardOrEnterpriseVersions,
} from 'src/features/Kubernetes/kubeUtils';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';

import { LocalStorageWarningNotice } from './KubernetesClusterDetail/LocalStorageWarningNotice';

import type { KubernetesTier } from '@linode/api-v4/lib/kubernetes';

interface Props {
  clusterID: number;
  clusterLabel: string;
  clusterTier: KubernetesTier;
  currentVersion: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeDialog = (props: Props) => {
  const {
    clusterID,
    clusterLabel,
    clusterTier,
    currentVersion,
    isOpen,
    onClose,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateKubernetesCluster } =
    useKubernetesClusterMutation(clusterID);

  const { versions } = useLkeStandardOrEnterpriseVersions(clusterTier);

  const nextVersion = getNextVersion(currentVersion, versions ?? []);

  const [hasUpdatedSuccessfully, setHasUpdatedSuccessfully] =
    React.useState(false);

  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setError(undefined);
      setSubmitting(false);
      setHasUpdatedSuccessfully(false);
    }
  }, [isOpen]);

  const onSubmitUpgradeDialog = () => {
    if (!nextVersion) {
      setError('Your Kubernetes Cluster is already on the latest version.');
      return;
    }
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
    ? 'Upgrade complete'
    : `Upgrade Kubernetes version ${
        nextVersion ? `to ${nextVersion}` : ''
      } on ${clusterLabel}?`;

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        label: hasUpdatedSuccessfully ? 'Recycle All Nodes' : 'Upgrade Version',
        loading: submitting,
        onClick: hasUpdatedSuccessfully
          ? onSubmitRecycleDialog
          : onSubmitUpgradeDialog,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={onClose}
      open={isOpen}
      title={dialogTitle}
    >
      <Typography>
        {hasUpdatedSuccessfully ? (
          <>
            The cluster’s Kubernetes version has been updated successfully to{' '}
            <strong>{nextVersion}</strong>. <br /> <br />
            To upgrade your existing worker nodes, you can recycle all nodes
            (which may have a performance impact) or perform other upgrade
            methods. When recycling nodes, all nodes are deleted on a rolling
            basis and new nodes are created to replace them. This may take
            several minutes.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/upgrade-a-cluster-to-a-newer-kubernetes-version#upgrade-worker-nodes">
              Learn more
            </Link>
            .
            <LocalStorageWarningNotice />
          </>
        ) : (
          <>
            Upgrade the Kubernetes version on <strong>{clusterLabel}</strong>{' '}
            from <strong>{currentVersion}</strong> to{' '}
            <strong>{nextVersion}</strong>. This upgrades the control plane on
            your cluster and ensures that any new worker nodes are created using
            the newer Kubernetes version.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/upgrade-a-cluster-to-a-newer-kubernetes-version">
              Learn more
            </Link>
            .
          </>
        )}
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(UpgradeDialog);
