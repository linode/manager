import Clear from '@mui/icons-material/Clear';
import Search from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { InputAdornment } from 'src/components/InputAdornment';
import { TextField, TextFieldProps } from 'src/components/TextField';

import { IconButton } from '../IconButton';

export interface DebouncedSearchProps extends TextFieldProps {
  className?: string;
  /**
   * Whether to show a clear button at the end of the input.
   */
  clearable?: boolean;
  /**
   * Including this prop will disable this field from being self-managed.
   * The user must then manage the state of the text field and provide a
   * value and change handler.
   */
  customValue?: {
    onChange: (newValue: string | undefined) => void;
    value: string | undefined;
  };
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
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const DebouncedSearchTextField = React.memo(
  (props: DebouncedSearchProps) => {
    const {
      InputProps,
      className,
      clearable,
      customValue,
      debounceTime,
      defaultValue,
      hideLabel,
      isSearching,
      label,
      onSearch,
      placeholder,
      ...restOfTextFieldProps
    } = props;

    // Manage the textfield state if customValue is not provided
    const managedValue = React.useState<string | undefined>();
    const [textFieldValue, setTextFieldValue] = customValue
      ? [customValue.value, customValue.onChange]
      : managedValue;

    React.useEffect(() => {
      if (textFieldValue != undefined) {
        const timeout = setTimeout(
          () => onSearch && onSearch(textFieldValue),
          debounceTime !== undefined ? debounceTime : 400
        );
        return () => clearTimeout(timeout);
      }
      return undefined;
    }, [debounceTime, onSearch, textFieldValue]);

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
                aria-label="Clear"
                onClick={() => setTextFieldValue('')}
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
        onChange={(e) => setTextFieldValue(e.target.value)}
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
