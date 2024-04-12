import { arrayToList } from 'src/utilities/arrayToList';
import { ExtendedType } from 'src/utilities/extendType';

import {
  DBAAS_DEDICATED_512_GB_PLAN,
  DEDICATED_512_GB_PLAN,
  PREMIUM_512_GB_PLAN,
} from './constants';
import { PlanSelectionType, TypeWithAvailability } from './types';

import type {
  Capabilities,
  LinodeTypeClass,
  Region,
  RegionAvailability,
} from '@linode/api-v4';

export type PlansTypes<T> = Record<LinodeTypeClass, T[]>;

interface PlansByType<T> extends Omit<PlansTypes<T>, 'nanode' | 'standard'> {
  shared: T[];
}

// We could update this to add or remove any new or existing plan tabs.
export const planTypeOrder: (
  | 'shared'
  | Exclude<LinodeTypeClass, 'nanode' | 'standard'>
)[] = [
  'prodedicated',
  'dedicated',
  'shared',
  'highmem',
  'gpu',
  'metal',
  'premium',
];

/**
 * getPlanSelectionsByPlanType function takes an array of types, groups
 * them based on their class property into different plan types, filters out empty
 * plan types, and returns an object containing the filtered plan selections.
 * getPlanSelectionsByPlanType is common util funtion used to provide plans by
 * type to Linode, Database and LKE plan tables.
 * The planTypeOrder array specifies the order in which the Linode types should be processed.
 * Any change to the order can result in incorrect rendering of plan tabs.
 */

export const getPlanSelectionsByPlanType = <
  T extends { class: LinodeTypeClass }
>(
  types: T[]
): PlansByType<T> => {
  const plansByType: PlansByType<T> = planTypeOrder.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as PlansByType<T>);

  // group plans by type
  for (const type of types) {
    switch (type.class) {
      case 'nanode':
      case 'standard':
        plansByType['shared'].push(type);
        break;
      default:
        if (plansByType.hasOwnProperty(type.class)) {
          plansByType[type.class].push(type);
        }
        break;
    }
  }

  // filter empty plan group
  return Object.keys(plansByType).reduce((acc, key) => {
    if (plansByType[key].length > 0) {
      acc[key] = plansByType[key];
    }
    return acc;
  }, {} as PlansByType<T>);
};

export const determineInitialPlanCategoryTab = (
  types: (ExtendedType | PlanSelectionType)[],
  selectedId?: string,
  currentPlanHeading?: string
): number => {
  const plans = getPlanSelectionsByPlanType(types);

  const tabOrder: LinodeTypeClass[] = Object.keys(plans).map((plan) =>
    plan === 'shared' ? 'standard' : (plan as LinodeTypeClass)
  );

  // Determine initial plan category tab based on current plan selection
  // (if there is one).
  const _selectedTypeClass =
    types.find(
      (type) => type.id === selectedId || type.heading === currentPlanHeading
    )?.class ?? 'dedicated';

  // We don't have a "Nanodes" tab anymore, so use `standard` (labeled as "Shared CPU").
  const selectedTypeClass =
    _selectedTypeClass === 'nanode' ? 'standard' : _selectedTypeClass;

  return tabOrder.indexOf(selectedTypeClass);
};

export const getRegionsWithCapability = (
  capability: Capabilities,
  regions: Region[]
) => {
  const withCapability = regions
    ?.filter((thisRegion: Region) =>
      thisRegion.capabilities.includes(capability)
    )
    .map((thisRegion: Region) => thisRegion.label);
  return arrayToList(withCapability ?? []);
};

interface LimitedAvailabilityPlanStatusOptions {
  plan: PlanSelectionType;
  regionAvailabilities: RegionAvailability[] | undefined;
  selectedRegionId: Region['id'] | undefined;
}

/**
 * Utility to determine if a plan is limited availability based on a region's availability.
 */
export const getIsLimitedAvailability = ({
  plan,
  regionAvailabilities,
  selectedRegionId,
}: LimitedAvailabilityPlanStatusOptions): boolean => {
  if (!regionAvailabilities || !selectedRegionId) {
    return false;
  }

  const availability = regionAvailabilities?.find((regionAvailability) => {
    const regionMatch = regionAvailability?.region === selectedRegionId;

    if (!regionMatch) {
      return false;
    }

    if (regionAvailability.plan === plan.id) {
      return regionAvailability.available === false;
    }

    return false;
  });

  return !!availability;
};

export const planTabInfoContent = {
  dedicated: {
    dataId: 'data-qa-dedicated',
    key: 'dedicated',
    title: 'Dedicated CPU',
    typography:
      'Dedicated CPU instances are good for full-duty workloads where consistent performance is important.',
  },
  gpu: {
    dataId: 'data-qa-gpu',
    key: 'gpu',
    title: 'GPU',
    typography:
      'Linodes with dedicated GPUs accelerate highly specialized applications such as machine learning, AI, and video transcoding.',
  },
  highmem: {
    dataId: 'data-qa-highmem',
    key: 'highmem',
    title: 'High Memory',
    typography:
      'High Memory instances favor RAM over other resources, and can be good for memory hungry use cases like caching and in-memory databases. All High Memory plans use dedicated CPU cores.',
  },
  metal: {
    dataId: 'data-qa-metal',
    key: 'metal',
    title: 'Bare Metal',
    typography:
      'Bare Metal Linodes give you full, dedicated access to a single physical machine. Some services, including backups, VLANs, and disk management, are not available with these plans.',
  },
  premium: {
    dataId: 'data-qa-premium',
    key: 'premium',
    title: 'Premium CPU',
    typography:
      'Premium CPU instances guarantee a minimum processor generation of AMD EPYC\u2122 Milan or newer to ensure consistent high performance for more demanding workloads.',
  },
  prodedicated: {
    dataId: 'data-qa-prodedi',
    key: 'prodedicated',
    title: 'Pro Dedicated CPU',
    typography:
      'Pro Dedicated CPU instances are for very demanding workloads. They only have AMD 2nd generation processors or newer.',
  },
  shared: {
    dataId: 'data-qa-standard',
    key: 'shared',
    title: 'Shared CPU',
    typography:
      'Shared CPU instances are good for medium-duty workloads and are a good mix of performance, resources, and price.',
  },
};

/**
 * If the Dedicated 512 GB plan is present in the response, overwrite it.
 * If it isn't, insert a placeholder at the end of the array.
 */
export const replaceOrAppendPlaceholder512GbPlans = (
  types: (ExtendedType | PlanSelectionType)[]
) => {
  const isInDatabasesFlow = types.some((type) => type.label.includes('DBaaS'));

  // Function to replace or append a specific plan
  const replaceOrAppendPlan = <T extends ExtendedType | PlanSelectionType>(
    planLabel: string,
    planData: T
  ) => {
    const index = types.findIndex((type) => type.label === planLabel);

    if (index !== -1) {
      types[index] = planData;
    } else {
      types.push(planData);
    }
  };

  if (isInDatabasesFlow) {
    replaceOrAppendPlan('DBaaS - Dedicated 512GB', DBAAS_DEDICATED_512_GB_PLAN);
  } else {
    // For Linodes and LKE
    replaceOrAppendPlan('Dedicated 512GB', DEDICATED_512_GB_PLAN);
    replaceOrAppendPlan('Premium 512GB', PREMIUM_512_GB_PLAN);
  }

  return types;
};

/**
 * Used to determine the contents of certain notices about availability and whether tooltips regarding
 * limited availability for plans are displayed within plan tables.
 *
 * @param plans An array of plans in a LinodeTypeClass, e.g. Dedicated or Shared plans
 *
 * @returns boolean
 */
export const isMajorityLimitedAvailabilityPlans = (
  plans: TypeWithAvailability[]
): boolean => {
  const plansTotal = plans.length;

  const countOfLimitedAvailabilityPlans = plans.filter(
    (plan) => plan.isLimitedAvailabilityPlan
  ).length;

  const limitedAvailabilityToTotalRatio =
    countOfLimitedAvailabilityPlans / plansTotal;

  if (limitedAvailabilityToTotalRatio > 0.5) {
    return true;
  }

  return false;
};
