import type {
  AccountAvailability,
  Capabilities,
  Country,
  Region,
} from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

export interface RegionSelectOption {
  data: {
    country: Country;
    region: string;
  };
  label: string;
  unavailable: boolean;
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
  handleSelection: (id: string) => void;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  regions: Region[];
  required?: boolean;
  selectedId: null | string;
  width?: number;
}

export interface RegionMultiSelectProps
  extends Omit<
    EnhancedAutocompleteProps<RegionSelectOption, false>,
    'label' | 'onChange' | 'options'
  > {
  SelectedRegionsList?: React.ComponentType<{
    onRemove: (option: RegionSelectOption) => void;
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
  width?: number;
}

export interface RegionOptionAvailability {
  accountAvailabilityData: AccountAvailability[] | undefined;
  currentCapability: Capabilities | undefined;
}

export interface GetRegionOptions extends RegionOptionAvailability {
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
