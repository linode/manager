import type { BaseType, Engines, RegionPriceObject } from '@linode/api-v4';
import type { ExtendedType } from 'src/utilities/extendType';

export interface PlanSelectionWithDatabaseType extends PlanSelectionType {
  engines: Engines;
}

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

interface ExtendedPlanWithAvailability
  extends ExtendedType,
    PlanSelectionAvailabilityTypes {}

interface PlanSelectionPlanWithAvailability
  extends PlanSelectionType,
    PlanSelectionAvailabilityTypes {}

export type PlanWithAvailability =
  | ExtendedPlanWithAvailability
  | PlanSelectionPlanWithAvailability;

export interface PlanSelectionAvailabilityTypes {
  planBelongsToDisabledClass: boolean;
  planBelongsToMTCTTDisabledGroup?: boolean;
  planHasLimitedAvailability: boolean;
  planIsDisabled512Gb: boolean;
  planIsSmallerThanUsage?: boolean;
  planIsTooSmall: boolean;
  planIsTooSmallForAPL?: boolean;
}

export interface DisabledTooltipReasons extends PlanSelectionAvailabilityTypes {
  wholePanelIsDisabled?: boolean;
}
