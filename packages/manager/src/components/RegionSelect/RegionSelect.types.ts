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
  // TODO DC_GET_WELL
  // Make this prop required & remove the undefined union type once all consumers are updated
  currentCapability?: Capabilities | undefined;
  handleSelection: (id: string) => void;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  regions: Region[];
  required?: boolean;
  selectedId: null | string;
  width?: number;
}

export interface RegionOptionAvailability {
  accountAvailabilityData: AccountAvailability[] | undefined;
  // TODO DC_GET_WELL
  // remove the undefined union type once all consumers are updated
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
