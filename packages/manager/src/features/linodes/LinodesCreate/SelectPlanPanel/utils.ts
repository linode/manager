import { PlanSelectionType } from './SelectPlanPanel';

interface FilteredPlanSelections {
  nanodes: PlanSelectionType[];
  standards: PlanSelectionType[];
  highmem: PlanSelectionType[];
  proDedicated: PlanSelectionType[];
  dedicated: PlanSelectionType[];
  gpu: PlanSelectionType[];
  metal: PlanSelectionType[];
  premium: PlanSelectionType[];
}

export const filterPlanSelectionTypes = (
  types: PlanSelectionType[]
): FilteredPlanSelections => {
  const filteredPlans: FilteredPlanSelections = {
    nanodes: [],
    standards: [],
    highmem: [],
    proDedicated: [],
    dedicated: [],
    gpu: [],
    metal: [],
    premium: [],
  };

  types.forEach((t: PlanSelectionType) => {
    if (/nanode/.test(t.class)) {
      filteredPlans.nanodes.push(t);
    }
    if (/standard/.test(t.class)) {
      filteredPlans.standards.push(t);
    }
    if (/highmem/.test(t.class)) {
      filteredPlans.highmem.push(t);
    }
    if (/prodedicated/.test(t.class)) {
      filteredPlans.proDedicated.push(t);
    }
    if (/^dedicated/.test(t.class)) {
      filteredPlans.dedicated.push(t);
    }
    if (/gpu/.test(t.class)) {
      filteredPlans.gpu.push(t);
    }
    if (t.class === 'metal') {
      filteredPlans.metal.push(t);
    }
    if (t.class === 'premium') {
      filteredPlans.premium.push(t);
    }
  });
  return filteredPlans;
};
