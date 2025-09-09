import { dedicatedTypeFactory, linodeTypeFactory } from '@linode/utilities';
import { getLatestKubernetesVersion } from 'support/util/lke';

import {
  lkeEnterpriseTypeFactory,
  lkeHighAvailabilityTypeFactory,
} from 'src/factories';

import { dcPricingMockLinodeTypes } from './dc-specific-pricing';

import type { KubernetesTieredVersion } from '@linode/api-v4';
import type { ExtendedType } from 'src/utilities/extendType';
import type { LkePlanDescription } from 'support/api/lke';

/**
 * Kubernetes versions available for cluster creation via Cloud Manager.
 */
export const kubernetesVersions = ['1.31', '1.30'];

/**
 * Enterprise kubernetes versions available for cluster creation via Cloud Manager.
 */
export const enterpriseKubernetesVersions = ['v1.31.1+lke1'];

/**
 * The latest Kubernetes version available for cluster creation via Cloud Manager.
 */
export const latestKubernetesVersion =
  getLatestKubernetesVersion(kubernetesVersions);

/**
 * The latest standard tier Kubernetes version available for cluster creation via Cloud Manager.
 */
export const latestStandardTierKubernetesVersion: KubernetesTieredVersion = {
  id: latestKubernetesVersion,
  tier: 'standard',
};

/**
 * The latest enterprise tier Kubernetes version available for cluster creation via Cloud Manager.
 */
export const latestEnterpriseTierKubernetesVersion: KubernetesTieredVersion = {
  id: getLatestKubernetesVersion(enterpriseKubernetesVersions),
  tier: 'enterprise',
};

/**
 * The following constants are shared between lke-create and lke-enterprise-create specs.
 */

export const dedicatedType = dedicatedTypeFactory.build({
  disk: 81920,
  id: 'g6-dedicated-2',
  label: 'Dedicated 4 GB',
  memory: 4096,
  price: {
    hourly: 0.054,
    monthly: 36.0,
  },
  region_prices: dcPricingMockLinodeTypes.find(
    (type) => type.id === 'g6-dedicated-2'
  )?.region_prices,
  vcpus: 2,
}) as ExtendedType;
export const nanodeType = linodeTypeFactory.build({
  disk: 51200,
  id: 'g6-standard-1',
  label: 'Linode 2 GB',
  memory: 2048,
  price: {
    hourly: 0.0095,
    monthly: 12.0,
  },
  region_prices: dcPricingMockLinodeTypes.find(
    (type) => type.id === 'g6-standard-1'
  )?.region_prices,
  vcpus: 1,
}) as ExtendedType;
const gpuType = linodeTypeFactory.build({
  class: 'gpu',
  id: 'g2-gpu-1',
}) as ExtendedType;
const highMemType = linodeTypeFactory.build({
  class: 'highmem',
  id: 'g7-highmem-1',
}) as ExtendedType;
const premiumType = linodeTypeFactory.build({
  class: 'premium',
  id: 'g7-premium-1',
}) as ExtendedType;

export const mockedLKEClusterTypes = [
  dedicatedType,
  nanodeType,
  gpuType,
  highMemType,
  premiumType,
];

export const mockedLKEEnterprisePrices = [
  lkeHighAvailabilityTypeFactory.build(),
  lkeEnterpriseTypeFactory.build(),
];

export const dedicatedNodeCount = 4;
export const nanodeNodeCount = 3;

export const clusterPlans: LkePlanDescription[] = [
  {
    nodeCount: dedicatedNodeCount,
    planName: 'Dedicated 4 GB',
    size: 4,
    tab: 'Dedicated CPU',
    type: 'dedicated',
  },
  {
    nodeCount: nanodeNodeCount,
    planName: 'Linode 2 GB',
    size: 24,
    tab: 'Shared CPU',
    type: 'standard',
  },
];
