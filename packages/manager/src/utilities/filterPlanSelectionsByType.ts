import { PlanSelectionType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { ExtendedType } from 'src/utilities/extendType';

interface FilteredLinodeDatabasePlansTypes {
  nanodes: PlanSelectionType[];
  standard: PlanSelectionType[];
  highMem: PlanSelectionType[];
  proDedicated: PlanSelectionType[];
  dedicated: PlanSelectionType[];
  gpu: PlanSelectionType[];
  metal: PlanSelectionType[];
  premium: PlanSelectionType[];
}

interface LKEPlansTypes {
  nanodes: ExtendedType[];
  standard: ExtendedType[];
  highMem: ExtendedType[];
  proDedicated: ExtendedType[];
  dedicated: ExtendedType[];
  gpu: ExtendedType[];
  metal: ExtendedType[];
  premium: ExtendedType[];
}

/*
The function 'filterLinodeOrDatabasePlanSelectionsByType' supports the Database plan selection table and the Linode create Plans table, 
while the function 'filterLKEPlanSelectionsByType' supports the LKE plan selection table. Since the types are 
tightly coupled among the components that consume these functions, we have kept them as two separate functions 
until we find a more robust solution to combine them into a single function.
*/

export const filterLinodeOrDatabasePlanSelectionsByType = (
  types: PlanSelectionType[]
) => {
  const filteredPlansByType: FilteredLinodeDatabasePlansTypes = {
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

export const filterLKEPlanSelectionsByType = (types: ExtendedType[]) => {
  const filteredLKEPlansTypes: LKEPlansTypes = {
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
        filteredLKEPlansTypes.nanodes.push(type);
        break;
      case 'standard':
        filteredLKEPlansTypes.standard.push(type);
        break;
      case 'highmem':
        filteredLKEPlansTypes.highMem.push(type);
        break;
      case 'prodedicated':
        filteredLKEPlansTypes.proDedicated.push(type);
        break;
      case 'dedicated':
        filteredLKEPlansTypes.dedicated.push(type);
        break;
      case 'gpu':
        filteredLKEPlansTypes.gpu.push(type);
        break;
      case 'metal':
        filteredLKEPlansTypes.metal.push(type);
        break;
      case 'premium':
        filteredLKEPlansTypes.premium.push(type);
        break;
      default:
        break;
    }
  }

  return filteredLKEPlansTypes;
};
