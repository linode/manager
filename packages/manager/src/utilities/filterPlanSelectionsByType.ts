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

  types.forEach((type) => {
    if (/nanode/.test(type.class)) {
      filteredPlansByType.nanodes.push(type);
    } else if (/standard/.test(type.class)) {
      filteredPlansByType.standard.push(type);
    } else if (/highmem/.test(type.class)) {
      filteredPlansByType.highMem.push(type);
    } else if (/prodedicated/.test(type.class)) {
      filteredPlansByType.proDedicated.push(type);
    } else if (/^dedicated/.test(type.class)) {
      filteredPlansByType.dedicated.push(type);
    } else if (/gpu/.test(type.class)) {
      filteredPlansByType.gpu.push(type);
    } else if (/metal/.test(type.class)) {
      filteredPlansByType.metal.push(type);
    } else if (/premium/.test(type.class)) {
      filteredPlansByType.premium.push(type);
    }
  });

  return filteredPlansByType;
};
