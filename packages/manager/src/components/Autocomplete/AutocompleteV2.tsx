import MuiAutocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';
import React, { useCallback } from 'react';

export const AutocompleteV2 = (
  props: AutocompleteProps<[], false, false, false>
) => {
  return <MuiAutocomplete {...props} options={props.options} />;
};
