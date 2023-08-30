import { Account } from '@linode/api-v4/lib/account';
import {
  KubeNodePoolResponse,
  KubernetesCluster,
  KubernetesVersion,
} from '@linode/api-v4/lib/kubernetes';
import { Region } from '@linode/api-v4/lib/regions';

import { FlagSet } from 'src/featureFlags';
import { ExtendedType } from 'src/utilities/extendType';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

export const nodeWarning = `We recommend a minimum of 3 nodes in each Node Pool to avoid downtime during upgrades and maintenance.`;
export const nodesDeletionWarning = `All nodes will be deleted and new nodes will be created to replace them.`;
export const localStorageWarning = `Any local storage (such as \u{2019}hostPath\u{2019} volumes) will be erased.`;

interface MonthlyPriceOptions {
  count: number;
  flags: FlagSet;
  region: Region['id'] | undefined;
  type: string;
  types: ExtendedType[];
}

interface TotalClusterPriceOptions {
  flags: FlagSet;
  highAvailabilityPrice?: number;
  pools: KubeNodePoolResponse[];
  region: Region['id'] | undefined;
  types: ExtendedType[];
}

export const getMonthlyPrice = ({
  count,
  flags,
  region,
  type,
  types,
}: MonthlyPriceOptions) => {
  if (!types) {
    return 0;
  }
  const thisType = types.find((t: ExtendedType) => t.id === type);
  const monthlyPrice = flags.dcSpecificPricing
    ? thisType && region
      ? getLinodeRegionPrice(thisType, region).monthly
      : undefined
    : thisType?.price.monthly;

  return thisType ? (monthlyPrice ?? 0) * count : 0;
};

export const getTotalClusterPrice = ({
  flags,
  highAvailabilityPrice,
  pools,
  region,
  types,
}: TotalClusterPriceOptions) => {
  const price = pools.reduce((accumulator, node) => {
    return (
      accumulator +
      getMonthlyPrice({
        count: node.count,
        flags,
        region,
        type: node.type,
        types,
      })
    );
  }, 0);

  return highAvailabilityPrice ? price + highAvailabilityPrice : price;
};

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

export const getDescriptionForCluster = (
  cluster: KubernetesCluster,
  regions: Region[]
) => {
  const region = regions.find((r) => r.id === cluster.region);
  const description: string[] = [
    `Kubernetes ${cluster.k8s_version}`,
    region?.label ?? cluster.region,
  ];

  if (cluster.control_plane.high_availability) {
    description.push(`High Availability`);
  }

  return description.join(', ');
};

export const getNextVersion = (
  currentVersion: string,
  versions: KubernetesVersion[]
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

export const getLatestVersion = (
  versions: { label: string; value: string }[]
) => {
  const versionsNumbersArray: number[] = [];

  for (const element of versions) {
    versionsNumbersArray.push(parseFloat(element.value));
  }
  const latestVersionValue = Math.max.apply(null, versionsNumbersArray);

  return { label: `${latestVersionValue}`, value: `${latestVersionValue}` };
};
