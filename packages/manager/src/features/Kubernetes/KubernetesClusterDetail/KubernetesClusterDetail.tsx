import { useAccount, useRegionsQuery } from '@linode/queries';
import { Box, CircleProgress, ErrorState, Stack } from '@linode/ui';
import { useLocation, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import {
  useAPLAvailability,
  useKubernetesBetaEndpoint,
} from 'src/features/Kubernetes/kubeUtils';
import { getKubeHighAvailability } from 'src/features/Kubernetes/kubeUtils';
import {
  useKubernetesClusterMutation,
  useKubernetesClusterQuery,
} from 'src/queries/kubernetes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { APLSummaryPanel } from './APLSummaryPanel';
import { KubeSummaryPanel } from './KubeSummaryPanel';
import { NodePoolsDisplay } from './NodePoolsDisplay/NodePoolsDisplay';
import { UpgradeKubernetesClusterToHADialog } from './UpgradeClusterDialog';
import UpgradeKubernetesVersionBanner from './UpgradeKubernetesVersionBanner';

export const KubernetesClusterDetail = () => {
  const { data: account } = useAccount();
  const { clusterID } = useParams({ strict: false });
  const id = Number(clusterID);
  const location = useLocation();
  const { showAPL } = useAPLAvailability();
  const { isUsingBetaEndpoint } = useKubernetesBetaEndpoint();

  const {
    data: cluster,
    error,
    isLoading,
  } = useKubernetesClusterQuery({
    id,
    isUsingBetaEndpoint,
  });
  const { data: regionsData } = useRegionsQuery();

  const { mutateAsync: updateKubernetesCluster } =
    useKubernetesClusterMutation(id);

  const { isClusterHighlyAvailable, showHighAvailability } =
    getKubeHighAvailability(account, cluster);

  const [updateError, setUpdateError] = React.useState<string | undefined>();
  const [isUpgradeToHAOpen, setIsUpgradeToHAOpen] = React.useState(false);

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
      <DocumentTitleSegment
        segment={`${cluster?.label} | Kubernetes Cluster`}
      />
      <UpgradeKubernetesVersionBanner
        clusterID={cluster?.id}
        clusterTier={cluster?.tier ?? 'standard'} // TODO LKE: remove fallback once LKE-E is in GA and tier is required
        currentVersion={cluster?.k8s_version}
      />
      <LandingHeader
        breadcrumbProps={{
          breadcrumbDataAttrs: { 'data-qa-breadcrumb': true },
          firstAndLastOnly: true,
          onEditHandlers: {
            editableTextTitle: cluster?.label,
            errorText: updateError,
            onCancel: resetEditableLabel,
            onEdit: handleLabelChange,
          },
          pathname: location.pathname,
        }}
        createButtonText="Upgrade to HA"
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-lke-linode-kubernetes-engine"
        onButtonClick={
          showHighAvailability && !isClusterHighlyAvailable
            ? handleUpgradeToHA
            : undefined
        }
        title="Kubernetes Cluster Details"
      />
      <Box>
        <Stack spacing={1}>
          <KubeSummaryPanel cluster={cluster} />
          {showAPL && cluster.apl_enabled && (
            <Box>
              <LandingHeader
                docsLabel="Docs"
                docsLink="https://apl-docs.net/"
                removeCrumbX={[1, 2, 3]}
                title="Application Platform for LKE"
              />

              <APLSummaryPanel cluster={cluster} />
            </Box>
          )}
          <NodePoolsDisplay
            clusterCreated={cluster.created}
            clusterID={cluster.id}
            clusterLabel={cluster.label}
            clusterRegionId={cluster.region}
            clusterTier={cluster.tier ?? 'standard'}
            regionsData={regionsData || []}
          />
        </Stack>
        <UpgradeKubernetesClusterToHADialog
          clusterID={cluster.id}
          onClose={() => setIsUpgradeToHAOpen(false)}
          open={isUpgradeToHAOpen}
          regionID={cluster.region}
        />
      </Box>
    </>
  );
};
