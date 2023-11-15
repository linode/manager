import type { Capabilities, Country, Region } from '@linode/api-v4';
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
  // Make this prop required once all consumers are updated
  currentCapability?: Capabilities;
  handleSelection: (id: string) => void;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  regions: Region[];
  required?: boolean;
  selectedId: null | string;
  width?: number;
}
