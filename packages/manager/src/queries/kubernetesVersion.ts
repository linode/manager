import {
  getKubernetesVersions,
  KubernetesVersion
} from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

const _getVersions = () => {
  return getKubernetesVersions().then(response => response.data);
};

export const useKubernetesVersionQuery = () =>
  useQuery<KubernetesVersion[], APIError[]>(
    'k8s_versions',
    _getVersions,
    queryPresets.oneTimeFetch
  );
