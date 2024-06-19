import type {
  AccountAvailability,
  Capabilities,
  Region,
  RegionSite,
} from '@linode/api-v4';
import type React from 'react';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

export interface DisableRegionOption {
  /**
   * The reason the region option is disabled.
   * This is shown to the user as a tooltip.
   */
  reason: JSX.Element | string;
  /**
   * An optional minWith applied to the tooltip
   * @default 215
   */
  tooltipWidth?: number;
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
   *
   * See `ImageUpload.tsx` for an example of a RegionSelect with an undefined `currentCapability` - there is no capability associated with Images yet.
   */
  currentCapability: Capabilities | undefined;
  /**
   * A key/value object for disabling regions by their ID.
   */
  disabledRegions?: Record<string, DisableRegionOption>;
  helperText?: string;
  label?: string;
  regionFilter?: RegionSite;
  regions: Region[];
  required?: boolean;
  showDistributedRegionIconHelperText?: boolean;
  tooltipText?: string;
  /**
   * The ID of the selected region.
   */
  value: string | undefined;
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

export type SupportedDistributedRegionTypes = 'Distributions' | 'StackScripts';
