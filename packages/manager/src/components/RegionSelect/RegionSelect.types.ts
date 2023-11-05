import { COUNTRY_CODE_TO_CONTINENT_CODE } from './RegionSelect.constants';

export type Country = keyof typeof COUNTRY_CODE_TO_CONTINENT_CODE;

import type { Region } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

export interface RegionSelectOption {
  data?: any;
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
