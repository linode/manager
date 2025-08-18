import type { KubeNodePoolResponse, KubernetesCluster } from '@linode/api-v4';

interface NodePoolVersionOptions {
  clusterVersion: KubernetesCluster['k8s_version'];
  nodePoolVersion: KubeNodePoolResponse['k8s_version'];
}

/**
 * This functions returns Autocomplete `options` for a Node Pool's possible versions.
 *
 * The only valid k8s_version options for a Node Pool are
 * - The Node Pool's current version
 * - The Cluster's k8s_version
 */
export function getNodePoolVersionOptions(options: NodePoolVersionOptions) {
  // The only valid versions are the Node Pool's version and the Cluster's version
  const versions = [options.clusterVersion, options.nodePoolVersion];

  // Filter out undefined versions. In some cases, Node Pool's `k8s_version` may be undefined
  const definedVersions = versions.filter((version) => version !== undefined);

  // Get unique versions because the Node Pool's version and the cluster's version can be the same
  const uniqueVersions = Array.from(new Set(definedVersions));

  // Map the versions to have a `label` field so they satisfy our Autocomplete's types
  return uniqueVersions.map((version) => ({ label: version }));
}
