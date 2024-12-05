import {
  CircleProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@linode/ui';
import Clear from '@mui/icons-material/Clear';
import Search from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import type { TextFieldProps } from '@linode/ui';

export interface DebouncedSearchProps extends TextFieldProps {
  className?: string;
  /**
   * Whether to show a clear button at the end of the input.
   */
  clearable?: boolean;
  /**
   * Interval in milliseconds of time that passes before search queries are accepted.
   * @default 400
   */
  debounceTime?: number;
  defaultValue?: string;
  hideLabel?: boolean;

  /**
   * Determines if the textbox is currently searching for inputted query
   */
  isSearching?: boolean;
  /**
   * Function to perform when searching for query
   */
  onSearch: (query: string) => void;
  placeholder?: string;
  value: string;
}

export const DebouncedSearchTextField = React.memo(
  (props: DebouncedSearchProps) => {
    const {
      InputProps,
      className,
      clearable,
      debounceTime,
      defaultValue,
      hideLabel,
      isSearching,
      label,
      onSearch,
      placeholder,
      value,
      ...restOfTextFieldProps
    } = props;

    const [textFieldValue, setTextFieldValue] = React.useState<string>('');

    // Memoize the debounced onChange handler to prevent unnecessary re-creations.
    const debouncedOnChange = React.useMemo(
      () =>
        debounce(debounceTime ?? 400, (e) => {
          onSearch(e.target.value);
          setTextFieldValue(e.target.value);
        }),
      [debounceTime, onSearch]
    );

    // Synchronize the internal state with the prop value when the value prop changes.
    React.useEffect(() => {
      if (value && value !== textFieldValue) {
        setTextFieldValue(value);
      }
    }, [value]);

    return (
      <TextField
        InputProps={{
          endAdornment: isSearching ? (
            <InputAdornment position="end">
              <CircleProgress size="sm" />
            </InputAdornment>
          ) : (
            clearable &&
            textFieldValue && (
              <IconButton
                onClick={() => {
                  setTextFieldValue('');
                  onSearch('');
                }}
                aria-label="Clear"
                size="small"
              >
                <Clear
                  sx={(theme) => ({
                    '&&': {
                      color: theme.color.grey1,
                    },
                  })}
                />
              </IconButton>
            )
          ),
          startAdornment: (
            <InputAdornment position="end">
              <StyledSearchIcon />
            </InputAdornment>
          ),
          ...InputProps,
        }}
        className={className}
        data-qa-debounced-search
        defaultValue={defaultValue}
        hideLabel={hideLabel}
        label={label}
        onChange={debouncedOnChange}
        placeholder={placeholder || 'Filter by query'}
        value={textFieldValue}
        {...restOfTextFieldProps}
      />
    );
  }
);

const StyledSearchIcon = styled(Search)(({ theme }) => ({
  '&&, &&:hover': {
    color: theme.color.grey1,
  },
}));
