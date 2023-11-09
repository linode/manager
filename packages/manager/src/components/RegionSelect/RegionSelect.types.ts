import type { Country, Region } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

export interface RegionSelectOption {
  data: {
    country: Country;
    disabledMessage: JSX.Element;
    region: string;
  };
  label: string;
  value: string;
}

export interface RegionSelectProps
  extends Omit<
    EnhancedAutocompleteProps<RegionSelectOption, false>,
    'label' | 'onChange' | 'options'
  > {
  handleSelection: (id: string) => void;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  regions: Region[];
  required?: boolean;
  selectedId: null | string;
  width?: number;
}
