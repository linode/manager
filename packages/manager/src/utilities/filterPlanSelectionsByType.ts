import { PlanSelectionType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

interface FilteredPlansTypes {
  nanodes: PlanSelectionType[];
  standard: PlanSelectionType[];
  highMem: PlanSelectionType[];
  proDedicated: PlanSelectionType[];
  dedicated: PlanSelectionType[];
  gpu: PlanSelectionType[];
  metal: PlanSelectionType[];
  premium: PlanSelectionType[];
}

export const filterPlanSelectionsByType = (types: PlanSelectionType[]) => {
  const filteredPlansByType: FilteredPlansTypes = {
    nanodes: [],
    standard: [],
    highMem: [],
    proDedicated: [],
    dedicated: [],
    gpu: [],
    metal: [],
    premium: [],
  };

  for (const type of types) {
    switch (type.class) {
      case 'nanode':
        filteredPlansByType.nanodes.push(type);
        break;
      case 'standard':
        filteredPlansByType.standard.push(type);
        break;
      case 'highmem':
        filteredPlansByType.highMem.push(type);
        break;
      case 'prodedicated':
        filteredPlansByType.proDedicated.push(type);
        break;
      case 'dedicated':
        filteredPlansByType.dedicated.push(type);
        break;
      case 'gpu':
        filteredPlansByType.gpu.push(type);
        break;
      case 'metal':
        filteredPlansByType.metal.push(type);
        break;
      case 'premium':
        filteredPlansByType.premium.push(type);
        break;
      default:
        break;
    }
  }

  return filteredPlansByType;
};
