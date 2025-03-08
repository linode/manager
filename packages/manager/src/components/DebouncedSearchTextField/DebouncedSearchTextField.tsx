import {
  CircleProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@linode/ui';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import Close from 'src/assets/icons/close.svg';
import Search from 'src/assets/icons/search.svg';

import type { InputProps, TextFieldProps } from '@linode/ui';

export interface DebouncedSearchProps extends TextFieldProps {
  /**
   * Class name to apply to the component.
   */
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
  /**
   * Default value of the input.
   */
  defaultValue?: string;
  /**
   * Whether to hide the label.
   */
  hideLabel?: boolean;
  /**
   * Custom props to apply to the input element.
   */
  inputSlotProps?: InputProps;
  /**
   * Determines if the textbox is currently searching for inputted query
   */
  isSearching?: boolean;
  /**
   * Function to perform when searching for query
   */
  onSearch: (query: string) => void;
  /**
   * Placeholder text for the input.
   */
  placeholder?: string;
  /**
   * Value of the input.
   */
  value: string;
}

export const DebouncedSearchTextField = React.memo(
  (props: DebouncedSearchProps) => {
    const {
      className,
      clearable,
      debounceTime,
      defaultValue,
      hideLabel,
      inputSlotProps,
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
            endAdornment: (
              <InputAdornment position="end">
                {isSearching ? (
                  <CircleProgress size="xs" />
                ) : clearable && textFieldValue ? (
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
                    <Close />
                  </IconButton>
                ) : null}
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            ...inputSlotProps,
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
