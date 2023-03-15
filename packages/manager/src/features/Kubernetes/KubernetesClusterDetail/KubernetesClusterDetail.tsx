import * as React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import { getKubeHighAvailability } from 'src/features/Kubernetes/kubeUtils';
import { useAccount } from 'src/queries/account';
import {
  useKubernetesClusterMutation,
  useKubernetesClusterQuery,
} from 'src/queries/kubernetes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import KubeSummaryPanel from './KubeSummaryPanel';
import { NodePoolsDisplay } from './NodePoolsDisplay/NodePoolsDisplay';
import { UpgradeKubernetesClusterToHADialog } from './UpgradeClusterDialog';
import UpgradeKubernetesVersionBanner from './UpgradeKubernetesVersionBanner';
import LandingHeader from 'src/components/LandingHeader';

export const KubernetesClusterDetail = () => {
  const { data: account } = useAccount();
  const { clusterID } = useParams<{ clusterID: string }>();
  const id = Number(clusterID);
  const location = useLocation();

  const { data: cluster, isLoading, error } = useKubernetesClusterQuery(id);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    id
  );

  const [updateError, setUpdateError] = React.useState<string | undefined>();

  const [isUpgradeToHAOpen, setIsUpgradeToHAOpen] = React.useState(false);

  const {
    showHighAvailability,
    isClusterHighlyAvailable,
  } = getKubeHighAvailability(account, cluster);

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Unable to load cluster data.')[0].reason
        }
      />
    );
  }

  if (isLoading || !cluster) {
    return <CircleProgress />;
  }

  const handleLabelChange = (newLabel: string) => {
    setUpdateError(undefined);

    return updateKubernetesCluster({ label: newLabel }).catch((e) => {
      setUpdateError(e[0].reason);
      return Promise.reject(e);
    });
  };

  const resetEditableLabel = () => {
    setUpdateError(undefined);
    return cluster?.label;
  };

  const handleUpgradeToHA = () => {
    setIsUpgradeToHAOpen(true);
  };

  return (
    <>
      <DocumentTitleSegment segment={`Kubernetes Cluster ${cluster?.label}`} />
      <Grid item>
        <UpgradeKubernetesVersionBanner
          clusterID={cluster?.id}
          clusterLabel={cluster?.label}
          currentVersion={cluster?.k8s_version}
        />
      </Grid>
      <LandingHeader
        title="Kubernetes Cluster Details"
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/"
        breadcrumbProps={{
          breadcrumbDataAttrs: { 'data-qa-breadcrumb': true },
          firstAndLastOnly: true,
          pathname: location.pathname,
          onEditHandlers: {
            editableTextTitle: cluster?.label,
            onEdit: handleLabelChange,
            onCancel: resetEditableLabel,
            errorText: updateError,
          },
        }}
        createButtonText="Upgrade to HA"
        onButtonClick={
          showHighAvailability && !isClusterHighlyAvailable
            ? handleUpgradeToHA
            : undefined
        }
      />
      <Grid item>
        <KubeSummaryPanel cluster={cluster} />
      </Grid>
      <Grid item>
        <NodePoolsDisplay clusterID={cluster.id} clusterLabel={cluster.label} />
      </Grid>
      <UpgradeKubernetesClusterToHADialog
        open={isUpgradeToHAOpen}
        onClose={() => setIsUpgradeToHAOpen(false)}
        clusterID={cluster.id}
      />
    </>
  );
};

export default KubernetesClusterDetail;
