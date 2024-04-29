import React from 'react';

import type {
  AccountAvailability,
  Capabilities,
  Country,
  Region,
  RegionSite,
} from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

export interface RegionSelectOption {
  data: {
    country: Country;
    region: string;
  };
  disabledProps?: {
    disabled: boolean;
    reason?: JSX.Element | string;
    tooltipWidth?: number;
  };
  label: string;
  site_type: RegionSite;
  value: string;
}

export interface RegionSelectProps
  extends Omit<
    EnhancedAutocompleteProps<RegionSelectOption, false>,
    'label' | 'onChange' | 'options'
  > {
  /**
   * The specified capability to filter the regions on. Any region that does not have the `currentCapability` will not appear in the RegionSelect dropdown.
   * Only use `undefined` for situations where there is no relevant capability for the RegionSelect - this will not filter any of the regions passed in.
   * Otherwise, a capability should always be passed in.
   *
   * See `ImageUpload.tsx` for an example of a RegionSelect with an undefined `currentCapability` - there is no capability associated with Images yet.
   */
  currentCapability: Capabilities | undefined;
  handleDisabledRegion?: (
    region: Region
  ) => RegionSelectOption['disabledProps'];
  handleSelection: (id: string) => void;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  regionFilter?: RegionSite;
  regions: Region[];
  required?: boolean;
  selectedId: null | string;
  showEdgeIconHelperText?: boolean;
  tooltipText?: string;
  width?: number;
}

export interface RegionMultiSelectProps
  extends Omit<
    EnhancedAutocompleteProps<RegionSelectOption, false>,
    'label' | 'onChange' | 'options'
  > {
  SelectedRegionsList?: React.ComponentType<{
    onRemove: (region: string) => void;
    selectedRegions: RegionSelectOption[];
  }>;
  currentCapability: Capabilities | undefined;
  handleSelection: (ids: string[]) => void;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  regions: Region[];
  required?: boolean;
  selectedIds: string[];
  sortRegionOptions?: (a: RegionSelectOption, b: RegionSelectOption) => number;
  tooltipText?: string;
  width?: number;
}

export interface RegionOptionAvailability {
  accountAvailabilityData: AccountAvailability[] | undefined;
  currentCapability: Capabilities | undefined;
  handleDisabledRegion?: (
    region: Region
  ) => RegionSelectOption['disabledProps'];
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

export type SupportedEdgeTypes = 'Distributions' | 'StackScripts';
