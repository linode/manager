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

interface ExtendedTypeWithAvailability
  extends ExtendedType,
    PlanSelectionAvailabilityTypes {}

interface PlanSelectionTypeWithAvailability
  extends PlanSelectionType,
    PlanSelectionAvailabilityTypes {}

export type TypeWithAvailability =
  | ExtendedTypeWithAvailability
  | PlanSelectionTypeWithAvailability;

export interface PlanSelectionAvailabilityTypes {
  planBelongsToDisabledClass: boolean;
  planHasLimitedAvailability: boolean;
  planIs512Gb: boolean;
}

export interface DisabledTooltipReasons extends PlanSelectionAvailabilityTypes {
  planIsTooSmall?: boolean;
}

export interface DisabledPlanSelectionTooltipProps {
  disabledReasons: DisabledTooltipReasons;
  hasMajorityOfPlansDisabled: boolean;
  wholePanelIsDisabled: boolean | undefined;
}
