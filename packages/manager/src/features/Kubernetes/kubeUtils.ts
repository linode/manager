import { useAccount, useAccountBetaQuery } from '@linode/queries';
import {
  getBetaStatus,
  isFeatureEnabledV2,
  sortByVersion,
} from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';
import {
  useKubernetesTieredVersionsQuery,
  useKubernetesVersionQuery,
} from 'src/queries/kubernetes';

import type { Account } from '@linode/api-v4/lib/account';
import type {
  KubeNodePoolResponse,
  KubernetesCluster,
  KubernetesTier,
  KubernetesTieredVersion,
  KubernetesVersion,
} from '@linode/api-v4/lib/kubernetes';
import type { ExtendedType } from 'src/utilities/extendType';

interface ClusterData {
  CPU: number;
  RAM: number;
  Storage: number;
}

export const getTotalClusterMemoryCPUAndStorage = (
  pools: KubeNodePoolResponse[],
  types: ExtendedType[]
) => {
  if (!types || !pools) {
    return { CPU: 0, RAM: 0, Storage: 0 };
  }

  return pools.reduce(
    (accumulator: ClusterData, thisPool: KubeNodePoolResponse) => {
      const thisType = types.find(
        (type: ExtendedType) => type.id === thisPool.type
      );
      if (!thisType) {
        return accumulator;
      }
      return {
        CPU: accumulator.CPU + thisType.vcpus * thisPool.count,
        RAM: accumulator.RAM + thisType.memory * thisPool.count,
        Storage: accumulator.Storage + thisType.disk * thisPool.count,
      };
    },
    { CPU: 0, RAM: 0, Storage: 0 }
  );
};

export const getDescriptionForCluster = (cluster: KubernetesCluster) => {
  const description: string[] = [
    `Kubernetes ${cluster.k8s_version}`,
    cluster.region,
  ];

  if (cluster.control_plane.high_availability) {
    description.push(`High Availability`);
  }

  return description.join(', ');
};

/**
 * Finds the next version for upgrade, given a current version and the list of all versions.
 * @param currentVersion The current cluster version
 * @param versions All available standard or enterprise versions
 * @returns The next version from which to upgrade from the current version
 */
export const getNextVersion = (
  currentVersion: string,
  versions: KubernetesTieredVersion[] | KubernetesVersion[] // TODO LKE-E: remove KubernetesVersion from type after GA.
) => {
  if (versions.length === 0) {
    return null;
  }
  const versionStrings = versions.map((v) => v.id).sort();
  const currentIdx = versionStrings.findIndex(
    (thisVersion) => currentVersion === thisVersion
  );
  if (currentIdx < 0) {
    // For now, assume that if nothing matches the user is on an obsolete version.
    // According to the LKE team's deprecation policy, there will only ever be
    // one such obsolete version, so this is safe. However, we'll eventually
    // have a version.deprecated field to work with, which will be cleaner
    // and safer.
    //
    // Example:
    // API returns [1.16, 1.17, 1.18].
    // You haven't upgraded in ages and your cluster is on 1.15.
    // The next available upgrade would be 1.16, which is the first item in the list.
    // Return that.
    //
    return versionStrings[0];
  }
  if (currentIdx === versions.length - 1) {
    return null;
  }
  return versionStrings[currentIdx + 1];
};

export const getKubeHighAvailability = (
  account: Account | undefined,
  cluster?: KubernetesCluster | null
) => {
  const showHighAvailability = account?.capabilities.includes(
    'LKE HA Control Planes'
  );

  const isClusterHighlyAvailable = Boolean(
    showHighAvailability && cluster?.control_plane.high_availability
  );

  return {
    isClusterHighlyAvailable,
    showHighAvailability,
  };
};

export const useAPLAvailability = () => {
  const flags = useFlags();

  // Only fetch the account beta if the APL flag is enabled
  const { data: beta, isLoading } = useAccountBetaQuery(
    'apl',
    Boolean(flags.apl)
  );

  const showAPL = beta !== undefined && getBetaStatus(beta) === 'active';

  return { isLoading: flags.apl && isLoading, showAPL };
};

export const getKubeControlPlaneACL = (
  account: Account | undefined,
  cluster?: KubernetesCluster | null
) => {
  const showControlPlaneACL = account?.capabilities.includes(
    'LKE Network Access Control List (IP ACL)'
  );

  const isClusterControlPlaneACLd = Boolean(
    showControlPlaneACL && cluster?.control_plane.acl
  );

  return {
    isClusterControlPlaneACLd,
    showControlPlaneACL,
  };
};

/**
 * Retrieves the latest version from an array of version objects.
 *
 * This function sorts an array of objects containing version information and returns the object
 * with the highest version number. The sorting is performed in ascending order based on the
 * `value` property of each object, and the last element of the sorted array, which represents
 * the latest version, is returned.
 *
 * @param {{label: string, value: string}[]} versions - An array of objects with `label` and `value`
 *                                                      properties where `value` is a version string.
 * @returns {{label: string, value: string}} Returns the object with the highest version number.
 *                                           If the array is empty, returns an default fallback object.
 *
 * @example
 * // Returns the latest version object
 * getLatestVersion([
 *   { label: 'Version 1.1', value: '1.1' },
 *   { label: 'Version 2.0', value: '2.0' }
 * ]);
 * // Output: { label: '2.0', value: '2.0' }
 */
export const getLatestVersion = (
  versions: { label: string; value: string }[]
): { label: string; value: string } => {
  const sortedVersions = versions.sort((a, b) => {
    return sortByVersion(a.value, b.value, 'asc');
  });

  const latestVersion = sortedVersions.pop();

  if (!latestVersion) {
    // Return a default fallback object
    return { label: '', value: '' };
  }

  return { label: `${latestVersion.value}`, value: `${latestVersion.value}` };
};

/**
 * Hook to determine if the LKE-Enterprise feature should be visible to the user.
 * Based on the user's account capability and the feature flag.
 *
 * @returns {boolean, boolean, boolean, boolean} - Whether the LKE-Enterprise flags are enabled for LA/GA and whether feature is enabled for LA/GA (flags + account capability).
 */
export const useIsLkeEnterpriseEnabled = () => {
  const flags = useFlags();
  const { data: account } = useAccount();

  const isLkeEnterpriseLAFlagEnabled = Boolean(
    flags?.lkeEnterprise?.enabled && flags.lkeEnterprise.la
  );
  const isLkeEnterpriseGAFlagEnabled = Boolean(
    flags.lkeEnterprise?.enabled && flags.lkeEnterprise.ga
  );

  const isLkeEnterpriseLAFeatureEnabled = isFeatureEnabledV2(
    'Kubernetes Enterprise',
    isLkeEnterpriseLAFlagEnabled,
    account?.capabilities ?? []
  );
  const isLkeEnterpriseGAFeatureEnabled = isFeatureEnabledV2(
    'Kubernetes Enterprise',
    isLkeEnterpriseGAFlagEnabled,
    account?.capabilities ?? []
  );

  return {
    isLkeEnterpriseGAFeatureEnabled,
    isLkeEnterpriseGAFlagEnabled,
    isLkeEnterpriseLAFeatureEnabled,
    isLkeEnterpriseLAFlagEnabled,
  };
};

/**
 * @todo Remove this hook and just use `useKubernetesTieredVersionsQuery` directly once we're in GA
 * since we'll always have a cluster tier.
 *
 * A hook to return the correct list of versions depending on the LKE cluster tier.
 * @param clusterTier Whether the cluster is standard or enterprise
 * @returns The list of either standard or enterprise k8 versions and query loading or error state
 */
export const useLkeStandardOrEnterpriseVersions = (
  clusterTier: KubernetesTier
) => {
  const { isLkeEnterpriseLAFeatureEnabled } = useIsLkeEnterpriseEnabled();

  /**
   * If LKE-E is enabled, use the data from the new /versions/<tier> endpoint for enterprise tiers.
   * If LKE-E is disabled, use the data from the existing /versions endpoint and disable the tiered query.
   */
  const {
    data: enterpriseTierVersions,
    error: enterpriseTierVersionsError,
    isFetching: enterpriseTierVersionsIsLoading,
  } = useKubernetesTieredVersionsQuery(
    'enterprise',
    isLkeEnterpriseLAFeatureEnabled
  );

  const {
    data: _versions,
    error: versionsError,
    isLoading: versionsIsLoading,
  } = useKubernetesVersionQuery();

  return {
    isLoadingVersions: enterpriseTierVersionsIsLoading || versionsIsLoading,
    versions:
      isLkeEnterpriseLAFeatureEnabled && clusterTier === 'enterprise'
        ? enterpriseTierVersions
        : _versions,
    versionsError: enterpriseTierVersionsError || versionsError,
  };
};

export const useKubernetesBetaEndpoint = () => {
  const { isLoading: isAPLAvailabilityLoading, showAPL } = useAPLAvailability();
  const { isLkeEnterpriseLAFeatureEnabled } = useIsLkeEnterpriseEnabled();
  const isUsingBetaEndpoint = showAPL || isLkeEnterpriseLAFeatureEnabled;

  return {
    isAPLAvailabilityLoading,
    isUsingBetaEndpoint,
  };
};
