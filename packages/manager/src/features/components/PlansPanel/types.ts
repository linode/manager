import type { BaseType, RegionPriceObject } from '@linode/api-v4';
import type { ExtendedType } from 'src/utilities/extendType';

export interface PlanSelectionType extends BaseType {
  class: ExtendedType['class'];
  formattedLabel: ExtendedType['formattedLabel'];
  heading: ExtendedType['heading'];
  network_out?: ExtendedType['network_out'];
  price: ExtendedType['price'];
  region_prices?: RegionPriceObject[];
  subHeadings: ExtendedType['subHeadings'];
  transfer?: ExtendedType['transfer'];
}

interface ExtendedTypeWithAvailability extends ExtendedType {
  isLimitedAvailabilityPlan: boolean;
}

interface PlanSelectionTypeWithAvailability extends PlanSelectionType {
  isLimitedAvailabilityPlan: boolean;
}

export type TypeWithAvailability =
  | ExtendedTypeWithAvailability
  | PlanSelectionTypeWithAvailability;
