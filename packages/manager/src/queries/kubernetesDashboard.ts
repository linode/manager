import {
  getKubernetesClusterDashboard,
  KubernetesDashboardResponse,
} from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

const useKubernetesDashboardQuery = (clusterID: number) => {
  return useQuery<KubernetesDashboardResponse, APIError>(
    ['k8s_dashboard', clusterID],
    () => getKubernetesClusterDashboard(clusterID)
  );
};

export default useKubernetesDashboardQuery;
