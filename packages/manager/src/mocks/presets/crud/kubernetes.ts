import {
  createKubernetesCluster,
  deleteKubernetesCluster,
  getKubernetesClusters,
  getKubernetesVersions,
  updateKubernetesCluster,
} from 'src/mocks/presets/crud/handlers/kubernetes';

import type { MockPresetCrud } from 'src/mocks/types';

export const kubernetesCrudPreset: MockPresetCrud = {
  group: { id: 'Kubernetes' },
  handlers: [
    createKubernetesCluster,
    deleteKubernetesCluster,
    getKubernetesClusters,
    getKubernetesVersions,
    updateKubernetesCluster,
  ],
  id: 'kubernetes:crud',
  label: 'Kubernetes CRUD',
};
