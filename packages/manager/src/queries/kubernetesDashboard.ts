import {
  getKubernetesClusterDashboard,
  KubernetesDashboardResponse,
} from '@linode/api-v4';
import { APIError } from '@linode/api-v4';
import { useQuery } from 'react-query';

const useKubernetesDashboardQuery = (
  clusterID: number,
  enabled: boolean = false
) => {
  return useQuery<KubernetesDashboardResponse, APIError[]>(
    ['k8s_dashboard', clusterID],
    () => getKubernetesClusterDashboard(clusterID),
    { enabled }
  );
};

export default useKubernetesDashboardQuery;
