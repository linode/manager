import React from 'react';

import type {
  AccountAvailability,
  Capabilities,
  Region,
  RegionSite,
} from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

export interface DisableRegionOption {
  reason: JSX.Element | string;
  tooltipWidth?: number;
}

export interface RegionSelectProps
  extends Omit<
    EnhancedAutocompleteProps<Region, false>,
    'label' | 'onChange' | 'options' | 'value'
  > {
  /**
   * The specified capability to filter the regions on. Any region that does not have the `currentCapability` will not appear in the RegionSelect dropdown.
   * Only use `undefined` for situations where there is no relevant capability for the RegionSelect - this will not filter any of the regions passed in.
   * Otherwise, a capability should always be passed in.
   *
   * See `ImageUpload.tsx` for an example of a RegionSelect with an undefined `currentCapability` - there is no capability associated with Images yet.
   */
  currentCapability: Capabilities | undefined;
  disabledRegions?: Record<string, DisableRegionOption>;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  onChange: (region: Region) => void;
  regionFilter?: RegionSite;
  regions: Region[];
  required?: boolean;
  showDistributedRegionIconHelperText?: boolean;
  tooltipText?: string;
  value: null | string;
  width?: number;
}

export interface RegionMultiSelectProps
  extends Omit<
    EnhancedAutocompleteProps<Region, false>,
    'label' | 'onChange' | 'options'
  > {
  SelectedRegionsList?: React.ComponentType<{
    onRemove: (region: string) => void;
    selectedRegions: Region[];
  }>;
  currentCapability: Capabilities | undefined;
  onChange: (ids: string[]) => void;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  regions: Region[];
  required?: boolean;
  selectedIds: string[];
  sortRegionOptions?: (a: Region, b: Region) => number;
  tooltipText?: string;
  width?: number;
}

export interface RegionOptionAvailability {
  accountAvailabilityData: AccountAvailability[] | undefined;
  currentCapability: Capabilities | undefined;
  handleDisabledRegion?: (
    region: Region
  ) => DisableRegionOption;
}

export interface GetRegionOptions extends RegionOptionAvailability {
  regionFilter?: RegionSite;
  regions: Region[];
}

export interface GetSelectedRegionById extends RegionOptionAvailability {
  regions: Region[];
  selectedRegionId: string;
}

export interface GetRegionOptionAvailability extends RegionOptionAvailability {
  region: Region;
}

export interface GetSelectedRegionsByIdsArgs {
  accountAvailabilityData: AccountAvailability[] | undefined;
  currentCapability: Capabilities | undefined;
  regions: Region[];
  selectedRegionIds: string[];
}

export type SupportedDistributedRegionTypes = 'Distributions' | 'StackScripts';
