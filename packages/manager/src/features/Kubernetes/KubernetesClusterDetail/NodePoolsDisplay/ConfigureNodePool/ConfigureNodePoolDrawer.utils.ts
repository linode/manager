import type { KubeNodePoolResponse, KubernetesCluster } from '@linode/api-v4';

interface NodePoolVersionOptions {
  clusterVersion: KubernetesCluster['k8s_version'];
  nodePoolVersion: KubeNodePoolResponse['k8s_version'];
}

/**
 * This function returns Autocomplete `options` for possible Node Pool versions.
 *
 * The only valid k8s_version options for a Node Pool are
 * - The Node Pool's current version
 * - The Cluster's k8s_version
 */
export function getNodePoolVersionOptions(options: NodePoolVersionOptions) {
  // The only valid versions are the Node Pool's version and the Cluster's version
  const versions = [options.nodePoolVersion, options.clusterVersion];

  // Filter out undefined versions. In some cases, Node Pool's `k8s_version` may be undefined
  const definedVersions = versions.filter((version) => version !== undefined);

  // Get unique versions because the Node Pool's version and the cluster's version can be the same
  return Array.from(new Set(definedVersions));
}
