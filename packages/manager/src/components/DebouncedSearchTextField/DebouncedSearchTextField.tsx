import {
  CircleProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@linode/ui';
import Clear from '@mui/icons-material/Clear';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import Search from 'src/assets/icons/search.svg';
import Close from 'src/assets/icons/close.svg';

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
        slotProps={{
          input: {
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
                  sx={{
                    padding: 0,
                  }}
                  aria-label="Clear"
                  size="small"
                >
                  <StyledClearIcon />
                </IconButton>
              )
            ),
            startAdornment: (
              <InputAdornment position="start">
                <StyledSearchIcon />
              </InputAdornment>
            ),
            sx: (theme) => ({
              '& .MuiInput-input': {
                padding: 0,
              },
              font: theme.tokens.typography.Label.Regular.S,
              padding: `${theme.tokens.spacing.S6} ${theme.tokens.spacing.S8}`,
            }),
            ...InputProps,
          },
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

export const StyledClearIcon = styled(Close, {
  label: 'StyledClearIcon',
})(({ theme }) => ({
  color: theme.tokens.search.Filled.Icon,
  height: '16px',
  width: '16px',
}));

export const StyledSearchIcon = styled(Search, {
  label: 'StyledSearchIcon',
})(({ theme }) => ({
  '&&': {
    '&:hover': {
      color: theme.tokens.search.Disabled.SearchIcon,
    },

    color: theme.tokens.search.Default.SearchIcon,
  },
}));
