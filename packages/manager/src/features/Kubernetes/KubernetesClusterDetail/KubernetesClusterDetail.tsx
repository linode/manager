import {
  getKubeConfig,
  getKubernetesClusterEndpoints,
  KubernetesEndpointResponse,
} from '@linode/api-v4/lib/kubernetes';
import * as React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocsLink from 'src/components/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import { getKubeHighAvailability } from 'src/features/Kubernetes/kubeUtils';
import useFlags from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import {
  useKubernetesClusterMutation,
  useKubernetesClusterQuery,
} from 'src/queries/kubernetes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAllWithArguments } from 'src/utilities/getAll';
import KubeSummaryPanel from './KubeSummaryPanel';
import { NodePoolsDisplay } from './NodePoolsDisplay/NodePoolsDisplay';
import { UpgradeKubernetesClusterToHADialog } from './UpgradeClusterDialog';
import UpgradeKubernetesVersionBanner from './UpgradeKubernetesVersionBanner';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      paddingRight: theme.spacing(),
    },
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(),
    },
  },
  error: {
    [theme.breakpoints.down('xs')]: {
      paddingBottom: 20,
    },
  },
  upgradeToHAButton: {
    marginLeft: 24,
  },
}));

const getAllEndpoints = getAllWithArguments<KubernetesEndpointResponse>(
  getKubernetesClusterEndpoints
);

export const KubernetesClusterDetail = () => {
  const classes = useStyles();
  const flags = useFlags();
  const { data: account } = useAccount();
  const { clusterID } = useParams<{ clusterID: string }>();
  const id = Number(clusterID);
  const location = useLocation();

  const { data: cluster, isLoading, error } = useKubernetesClusterQuery(id);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    id
  );

  const [endpoint, setEndpoint] = React.useState<string | null>(null);
  const [endpointError, setEndpointError] = React.useState<string | undefined>(
    undefined
  );
  const [endpointLoading, setEndpointLoading] = React.useState<boolean>(false);

  const [updateError, setUpdateError] = React.useState<string | undefined>();

  const [
    kubeconfigAvailable,
    setKubeconfigAvailability,
  ] = React.useState<boolean>(false);
  const [kubeconfigError, setKubeconfigError] = React.useState<
    string | undefined
  >(undefined);

  const endpointAvailabilityInterval = React.useRef<number>();
  const kubeconfigAvailabilityInterval = React.useRef<number>();

  // @todo: Poll with React Query
  // usePolling([() => props.requestNodePools(+props.match.params.clusterID)]);

  const getEndpointToDisplay = (endpoints: string[]) => {
    // Per discussions with the API team and UX, we should display only the endpoint with port 443, so we are matching on that.
    return endpoints.find((thisResponse) =>
      thisResponse.match(/linodelke\.net:443$/i)
    );
  };

  const successfulClusterEndpointResponse = (endpoints: string[]) => {
    setEndpointError(undefined);

    const endpointToDisplay = getEndpointToDisplay(endpoints);

    setEndpoint(endpointToDisplay ?? null);
    setEndpointLoading(false);
    clearInterval(endpointAvailabilityInterval.current);
  };

  // Create a function to check if the Kubeconfig is available.
  const kubeconfigAvailabilityCheck = (
    clusterID: number,
    startInterval: boolean = false
  ) => {
    getKubeConfig(clusterID)
      .then(() => {
        kubeconfigAvailableEndInterval();
      })
      .catch((error) => {
        if (startInterval) {
          setKubeconfigAvailability(false);

          if (error?.[0]?.reason.match(/not yet available/i)) {
            // If it is not yet available, set kubeconfigAvailabilityInterval equal to function that continues polling the endpoint every 30 seconds to grab it when it is
            kubeconfigAvailabilityInterval.current = window.setInterval(() => {
              kubeconfigAvailabilityCheck(clusterID);
            }, 30 * 1000);
          } else {
            setKubeconfigError(
              getAPIErrorOrDefault(error, 'Kubeconfig not available.')[0].reason
            );
          }
        }
      });
  };

  const kubeconfigAvailableEndInterval = () => {
    setKubeconfigAvailability(true);
    clearInterval(kubeconfigAvailabilityInterval.current);
  };

  React.useEffect(() => {
    if (clusterID) {
      // A function to check if the endpoint is available.
      const endpointAvailabilityCheck = () => {
        getAllEndpoints([clusterID])
          .then((response) => {
            successfulClusterEndpointResponse(
              response.data.map((thisEndpoint) => thisEndpoint.endpoint)
            );
          })
          .catch((_error) => {
            // Do nothing since endpoint is null by default, and in the instances where this function is called, endpointAvailabilityInterval has been set in motion already.
          });
      };

      // props.requestClusterForStore(Number(clusterID)).catch((_) => null); // Handle in Redux
      // The cluster endpoint has its own API...uh, endpoint, so we need
      // to request it separately.
      setEndpointLoading(true);
      getAllEndpoints([Number(clusterID)])
        .then((response) => {
          successfulClusterEndpointResponse(
            response.data.map((thisEndpoint) => thisEndpoint.endpoint)
          );
        })
        .catch((error) => {
          setEndpointLoading(false);

          // If the error is that the endpoint is not yet available, set endpointAvailabilityInterval equal to function that continues polling the endpoint every 5 seconds to grab it when it is.
          if (error?.[0]?.reason.match(/endpoints are not yet available/i)) {
            endpointAvailabilityInterval.current = window.setInterval(() => {
              endpointAvailabilityCheck();
            }, 5000);
          } else {
            setEndpointError(
              getAPIErrorOrDefault(error, 'Cluster endpoint not available.')[0]
                .reason
            );
          }
        });

      kubeconfigAvailabilityCheck(Number(clusterID), true);
    }

    return () => {
      clearInterval(endpointAvailabilityInterval.current);
      clearInterval(kubeconfigAvailabilityInterval.current);
    };
  }, [clusterID]);

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
      <Grid container className={classes.root} justifyContent="space-between">
        <Grid item className="p0">
          <Breadcrumb
            onEditHandlers={{
              editableTextTitle: cluster?.label,
              onEdit: handleLabelChange,
              onCancel: resetEditableLabel,
              errorText: updateError,
            }}
            firstAndLastOnly
            pathname={location.pathname}
            data-qa-breadcrumb
          />
        </Grid>
        <Grid
          item
          className="p0"
          style={{ marginTop: 14, marginBottom: 8, display: 'flex' }}
        >
          <DocsLink href="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/" />
          {showHighAvailability && !isClusterHighlyAvailable ? (
            <Button
              className={classes.upgradeToHAButton}
              buttonType="primary"
              onClick={() => setIsUpgradeToHAOpen(true)}
            >
              Upgrade to HA
            </Button>
          ) : null}
        </Grid>
      </Grid>
      <Grid item>
        <KubeSummaryPanel
          cluster={cluster}
          endpoint={endpoint}
          endpointError={endpointError}
          endpointLoading={endpointLoading}
          kubeconfigAvailable={kubeconfigAvailable}
          kubeconfigError={kubeconfigError}
          handleUpdateTags={(newTags: string[]) =>
            updateKubernetesCluster({
              tags: newTags,
            })
          }
          isClusterHighlyAvailable={isClusterHighlyAvailable}
          isKubeDashboardFeatureEnabled={Boolean(
            flags.kubernetesDashboardAvailability
          )}
        />
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
