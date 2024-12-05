import type {
  AccountAvailability,
  Capabilities,
  Region,
  RegionSite,
} from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from '@linode/ui';
import type React from 'react';
import type { DisableItemOption } from 'src/components/ListItemOption';

export type RegionFilterValue =
  | 'distributed-AF'
  | 'distributed-ALL'
  | 'distributed-AS'
  | 'distributed-EU'
  | 'distributed-NA'
  | 'distributed-OC'
  | 'distributed-SA'
  | RegionSite;

export interface GetRegionLabel {
  includeSlug?: boolean;
  region: Region;
}
export interface RegionSelectProps<
  DisableClearable extends boolean | undefined = undefined
> extends Omit<
    EnhancedAutocompleteProps<Region, false, DisableClearable>,
    'label' | 'options' | 'value'
  > {
  /**
   * The specified capability to filter the regions on. Any region that does not have the `currentCapability` will not appear in the RegionSelect dropdown.
   * Only use `undefined` for situations where there is no relevant capability for the RegionSelect - this will not filter any of the regions passed in.
   * Otherwise, a capability should always be passed in.
   */
  currentCapability: Capabilities | undefined;
  /**
   * A key/value object for disabling regions by their ID.
   */
  disabledRegions?: Record<string, DisableItemOption>;
  helperText?: string;
  /**
   * Ignores account availability information when rendering region options
   * @default false
   */
  ignoreAccountAvailability?: boolean;
  label?: string;
  regionFilter?: RegionFilterValue;
  regions: Region[];
  required?: boolean;
  tooltipText?: string;
  /**
   * The ID of the selected region.
   */
  value: string | undefined;
  width?: number;
}

export interface RegionMultiSelectProps
  extends Omit<
    EnhancedAutocompleteProps<Region, true>,
    'label' | 'onChange' | 'options'
  > {
  SelectedRegionsList?: React.ComponentType<{
    onRemove: (region: string) => void;
    selectedRegions: Region[];
  }>;
  currentCapability: Capabilities | undefined;
  disabledRegions?: Record<string, DisableItemOption>;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  onChange: (ids: string[]) => void;
  regions: Region[];
  required?: boolean;
  selectedIds: string[];
  sortRegionOptions?: (a: Region, b: Region) => number;
  tooltipText?: string;
  width?: number;
}

export interface GetRegionOptionAvailability {
  accountAvailabilityData: AccountAvailability[] | undefined;
  currentCapability: Capabilities | undefined;
  region: Region;
}
