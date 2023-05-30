import type { LinodeTypeClass } from '@linode/api-v4';
import { ExtendedType } from 'src/utilities/extendType';
import { PlanSelectionType } from './PlansPanel';

export type PlansTypes<T> = Record<LinodeTypeClass, T[]>;

/**
 * getPlanSelectionsByPlanType is common util funtion used to provide filtered plans by
 * type to Linode, Database and LKE plan tables.
 */

export const getPlanSelectionsByPlanType = <
  T extends { class: LinodeTypeClass }
>(
  types: T[]
) => {
  const plansByType: PlansTypes<T> = {
    nanode: [],
    standard: [],
    highmem: [],
    prodedicated: [],
    dedicated: [],
    gpu: [],
    metal: [],
    premium: [],
  };

  for (const type of types) {
    switch (type.class) {
      case 'nanode':
        plansByType.nanode.push(type);
        break;
      case 'standard':
        plansByType.standard.push(type);
        break;
      case 'highmem':
        plansByType.highmem.push(type);
        break;
      case 'prodedicated':
        plansByType.prodedicated.push(type);
        break;
      case 'dedicated':
        plansByType.dedicated.push(type);
        break;
      case 'gpu':
        plansByType.gpu.push(type);
        break;
      case 'metal':
        plansByType.metal.push(type);
        break;
      case 'premium':
        plansByType.premium.push(type);
        break;
      default:
        break;
    }
  }

  const updatedPlans = {
    prodedicated: plansByType.prodedicated,
    dedicated: plansByType.dedicated,
    shared: [...plansByType.nanode, ...plansByType.standard],
    highmem: plansByType.highmem,
    gpu: plansByType.gpu,
    metal: plansByType.metal,
    premium: plansByType.premium,
  };

  Object.keys(updatedPlans).forEach((key) => {
    if (updatedPlans[key].length === 0) {
      delete updatedPlans[key];
    }
  });

  return updatedPlans;
};

export const determineInitialPlanCategoryTab = <T>(
  types: (ExtendedType | PlanSelectionType)[],
  selectedID?: string,
  currentPlanHeading?: string
) => {
  const plans = getPlanSelectionsByPlanType(types);

  const tabOrder: LinodeTypeClass[] = Object.keys(plans).map((plan) =>
    plan === 'shared' ? 'standard' : (plan as LinodeTypeClass)
  );

  // Determine initial plan category tab based on current plan selection
  // (if there is one).
  const _selectedTypeClass =
    types.find(
      (type) => type.id === selectedID || type.heading === currentPlanHeading
    )?.class ?? 'dedicated';

  // We don't have a "Nanodes" tab anymore, so use `standard` (labeled as "Shared CPU").
  const selectedTypeClass =
    _selectedTypeClass === 'nanode' ? 'standard' : _selectedTypeClass;

  const initialTab = tabOrder.indexOf(selectedTypeClass);

  return initialTab;
};

export const planTabInfoContent = {
  prodedicated: {
    typography:
      'Pro Dedicated CPU instances are for very demanding workloads. They only have AMD 2nd generation processors or newer.',
    title: 'Pro Dedicated CPU',
    key: 'prodedicated',
    dataId: 'data-qa-prodedi',
  },
  dedicated: {
    typography:
      'Dedicated CPU instances are good for full-duty workloads where consistent performance is important.',
    title: 'Dedicated CPU',
    key: 'dedicated',
    dataId: 'data-qa-dedicated',
  },
  shared: {
    typography:
      ' Shared CPU instances are good for medium-duty workloads and are a good mix of performance, resources, and price.',
    title: 'Shared CPU',
    key: 'shared',
    dataId: 'data-qa-standard',
  },
  highmem: {
    typography:
      'High Memory instances favor RAM over other resources, and can be good for memory hungry use cases like caching and in-memory databases. All High Memory plans use dedicated CPU cores.',
    title: 'High Memory',
    key: 'highmem',
    dataId: 'data-qa-highmem',
  },
  gpu: {
    typography:
      'Linodes with dedicated GPUs accelerate highly specialized applications such as machine learning, AI, and video transcoding.',
    title: 'GPU',
    key: 'gpu',
    dataId: 'data-qa-gpu',
  },
  metal: {
    typography:
      'Bare Metal Linodes give you full, dedicated access to a single physical machine. Some services, including backups, VLANs, and disk management, are not available with these plans.',
    title: 'Bare Metal',
    key: 'metal',
    dataId: 'data-qa-metal',
  },
  premium: {
    typography:
      'Premium CPU instances guarantee a minimum processor model, AMD Epyc\u2122 7713 or higher, to ensure consistent high performance for more demanding workloads.',
    title: 'Premium',
    key: 'premium',
    dataId: 'data-qa-premium',
  },
};
