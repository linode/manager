import CloseIcon from '@mui/icons-material/Close';
import MuiAutocomplete from '@mui/material/Autocomplete';
import React from 'react';

import ChevronDownIcon from 'src/assets/icons/chevron-down.svg';

import { Box } from '../Box';
import { CircleProgress } from '../CircleProgress';
import { InputAdornment } from '../InputAdornment';
import { TextField } from '../TextField';
import {
  CustomPopper,
  SelectedIcon,
  StyledListItem,
} from './Autocomplete.styles';

import type { TextFieldProps } from '../TextField';
import type {
  AutocompleteProps,
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';

export interface EnhancedAutocompleteProps<
  T extends { label: string },
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> extends Omit<
    AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
    'renderInput'
  > {
  /** Removes "select all" option for multiselect */
  disableSelectAll?: boolean;
  /** Provides a hint with error styling to assist users. */
  errorText?: string;
  /** Provides a hint with normal styling to assist users. */
  helperText?: TextFieldProps['helperText'];
  /** A required label for the Autocomplete to ensure accessibility. */
  label: string;
  /** Removes the top margin from the input label, if desired. */
  noMarginTop?: boolean;
  /** Element to show when the Autocomplete search yields no results. */
  noOptionsText?: JSX.Element | string;
  placeholder?: string;
  renderInput?: (_params: AutocompleteRenderInputParams) => React.ReactNode;
  /** Label for the "select all" option. */
  selectAllLabel?: string;
  textFieldProps?: Partial<TextFieldProps>;
}

/**
 * An Autocomplete component that provides a user-friendly select input
 * allowing selection between options.
 *
 * @example
 * <Autocomplete
 *  label="Select a Fruit"
 *  onSelectionChange={(selected) => console.log(selected)}
 *  options={[
 *    {
 *      label: 'Apple',
 *      value: 'apple',
 *    }
 *  ]}
 * />
 */
export const Autocomplete = <
  T extends { label: string },
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: EnhancedAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>
) => {
  const {
    clearOnBlur,
    defaultValue,
    disablePortal = true,
    disableSelectAll = false,
    errorText = '',
    helperText,
    label,
    limitTags = 2,
    loading = false,
    loadingText,
    multiple,
    noMarginTop,
    noOptionsText,
    onBlur,
    onChange,
    options,
    placeholder,
    renderInput,
    renderOption,
    selectAllLabel = '',
    textFieldProps,
    value,
    ...rest
  } = props;

  const isSelectAllActive =
    multiple && Array.isArray(value) && value.length === options.length;

  const selectAllText = isSelectAllActive ? 'Deselect All' : 'Select All';

  const selectAllOption = { label: `${selectAllText} ${selectAllLabel}` };

  const optionsWithSelectAll = [selectAllOption, ...options] as T[];

  return (
    <MuiAutocomplete
      options={
        multiple && !disableSelectAll && options.length > 0
          ? optionsWithSelectAll
          : options
      }
      renderInput={
        renderInput
          ? renderInput
          : (params) => (
              <TextField
                errorText={errorText}
                helperText={helperText}
                inputId={params.id}
                label={label}
                loading={loading}
                noMarginTop={noMarginTop}
                placeholder={placeholder ?? 'Select an option'}
                required={textFieldProps?.InputProps?.required}
                tooltipText={textFieldProps?.tooltipText}
                {...params}
                {...textFieldProps}
                InputProps={{
                  ...params.InputProps,
                  ...textFieldProps?.InputProps,
                  endAdornment: (
                    <>
                      {loading && (
                        <InputAdornment position="end">
                          <CircleProgress noPadding size="xs" />
                        </InputAdornment>
                      )}
                      {textFieldProps?.InputProps?.endAdornment}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )
      }
      renderOption={(props, option, state, ownerState) => {
        const isSelectAllOption = option === selectAllOption;
        const ListItem = isSelectAllOption ? StyledListItem : 'li';

        return renderOption ? (
          renderOption(props, option, state, ownerState)
        ) : (
          <ListItem {...props} data-qa-option key={props.key}>
            <>
              <Box
                sx={{
                  flexGrow: 1,
                }}
              >
                {rest.getOptionLabel
                  ? rest.getOptionLabel(option)
                  : option.label}
              </Box>
              <SelectedIcon visible={state.selected} />
            </>
          </ListItem>
        );
      }}
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      PopperComponent={CustomPopper}
      clearOnBlur={clearOnBlur}
      data-qa-autocomplete={label}
      defaultValue={defaultValue}
      disableCloseOnSelect={multiple}
      disablePortal={disablePortal}
      limitTags={limitTags}
      loading={loading}
      loadingText={loadingText || 'Loading...'}
      multiple={multiple}
      noOptionsText={noOptionsText || <i>You have no options to choose from</i>}
      onBlur={onBlur}
      popupIcon={<ChevronDownIcon data-testid="KeyboardArrowDownIcon" />}
      value={value}
      {...rest}
      onChange={(e, value, reason, details) => {
        if (onChange) {
          if (details?.option === selectAllOption) {
            if (isSelectAllActive) {
              if (typeof value === typeof []) {
                onChange(e, ([] as T[]) as typeof value, reason, details);
              }
            } else {
              if (typeof value === typeof options) {
                onChange(e, options as typeof value, reason, details);
              }
            }
          } else {
            onChange(e, value, reason, details);
          }
        }
      }}
    />
  );
};
