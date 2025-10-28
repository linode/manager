import {
  CircleProgress,
  CloseIcon,
  IconButton,
  InputAdornment,
  TextField,
} from '@linode/ui';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

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
  value?: string;
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

    const debouncedRef = React.useRef<null | ReturnType<typeof debounce>>(null);

    React.useEffect(() => {
      // Cancel any pending call from a previous instance.
      debouncedRef.current?.cancel();

      debouncedRef.current = debounce(
        debounceTime ?? 400,
        (e: React.ChangeEvent<HTMLInputElement>) => {
          onSearch(e.target.value);
          setTextFieldValue(e.target.value);
        }
      );

      return () => {
        debouncedRef.current?.cancel();
      };
    }, [debounceTime, onSearch]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedRef.current?.(e);
      },
      []
    );

    // Synchronize the internal state with the prop value when the value prop changes.
    React.useEffect(() => {
      if (value !== textFieldValue) {
        setTextFieldValue(value ?? '');
      }
    }, [value]);

    return (
      <TextField
        className={className}
        data-qa-debounced-search
        defaultValue={defaultValue}
        hideLabel={hideLabel}
        label={label}
        onChange={handleChange}
        placeholder={placeholder || 'Filter by query'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {isSearching && <CircleProgress noPadding size="xs" />}
                {clearable && Boolean(textFieldValue) && (
                  <IconButton
                    aria-label="Clear"
                    onClick={() => {
                      debouncedRef.current?.cancel();
                      setTextFieldValue('');
                      onSearch('');
                    }}
                    size="small"
                    sx={{ padding: 0 }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <Search data-testid="SearchIcon" />
              </InputAdornment>
            ),
            ...inputSlotProps,
          },
        }}
        value={textFieldValue}
        {...restOfTextFieldProps}
      />
    );
  }
);
