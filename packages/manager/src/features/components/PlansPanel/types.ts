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

export interface PlanSelectionAvailabilityTypes {
  belongsToDisabledClass: boolean;
  isDisabled512GbPlan: boolean;
  isLimitedAvailabilityPlan: boolean;
  isManuallyDisabled: boolean;
}
interface ExtendedTypeWithAvailability
  extends ExtendedType,
    PlanSelectionAvailabilityTypes {}

interface PlanSelectionTypeWithAvailability
  extends PlanSelectionType,
    PlanSelectionAvailabilityTypes {}

export type TypeWithAvailability =
  | ExtendedTypeWithAvailability
  | PlanSelectionTypeWithAvailability;
