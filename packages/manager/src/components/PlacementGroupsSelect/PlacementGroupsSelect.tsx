import { PlacementGroup } from '@linode/api-v4';
// import { APIError } from '@linode/api-v4/lib/types';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { CustomPopper } from 'src/components/Autocomplete/Autocomplete.styles';
import { useAllPlacementGroupsQuery } from 'src/queries/placementGroups';

export interface PlacementGroupsSelectProps {
  /** Whether to display the clear icon. Defaults to `true`. */
  clearable?: boolean;
  /** Disable editing the input value. */
  disabled?: boolean;
  /** Hint displayed with error styling. */
  errorText?: string;
  /** The ID of the input. */
  id?: string;
  /** Override the default "Placement Groups" or "Placement Groups" label */
  label?: string;
  /** Adds styling to indicate a loading state. */
  loading?: boolean;
  /* Enable single-select. */
  multiple?: false;
  /** Optionally disable top margin for input label */
  noMarginTop?: boolean;
  /** Message displayed when no options match the user's search. */
  noOptionsMessage?: string;
  /* The options to display in the select. */
  /** Called when the input loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /* Called when the value changes */
  onSelectionChange?: (selected: PlacementGroup | null) => void;
  // options?: PlacementGroup[];
  options?: string[];
  /** Determine which Placement Groups should be available as options. */
  optionsFilter?: (placementGroup: PlacementGroup) => boolean;
  /* Render a custom option. */
  renderOption?: (
    placementGroup: PlacementGroup,
    selected: boolean
  ) => JSX.Element;
  /* Render a custom option label. */
  renderOptionLabel?: (placementGroup: PlacementGroup) => string;
  /* Displays an indication that the input is required. */
  required?: boolean;
  /* Adds custom styles to the component. */
  sx?: SxProps;
  /* The `id` of the selected Placement Groups or a function that should return `true` if the NodeBalancer should be selected. */
  value?: ((placementGroup: PlacementGroup) => boolean) | null | number;
}

export const PlacementGroupsSelect = (props: PlacementGroupsSelectProps) => {
  const {
    // clearable = true,
    disabled,
    errorText,
    id,
    label,
    loading,
    multiple = false,
    noMarginTop,
    noOptionsMessage,
    onBlur,
    // onSelectionChange,
    // options,
    // optionsFilter,
    renderOption,
    renderOptionLabel,
    sx,
    value,
  } = props;

  const [inputValue, setInputValue] = React.useState('');

  const {
    data: placementGroups,
    error,
    isLoading,
  } = useAllPlacementGroupsQuery();

  React.useEffect(() => {
    if (value === null) {
      setInputValue('');
    }
  }, [value]);

  return (
    <h3>....</h3>
    // <Autocomplete
    //   getOptionLabel={(placementGroup: PlacementGroup) =>
    //     renderOptionLabel
    //       ? renderOptionLabel(placementGroup)
    //       : `${placementGroup.label} ${placementGroup.affinity_type}`
    //   }
    //   noOptionsText={getStatusText}
    //   renderOption={
    //     renderOption
    //       ? (props, option, { selected }) => {
    //         // return (
    //         //   <li {...props} data-qa-placement-group-option>
    //         //     {renderOption(option, selected)}
    //         //   </li>
    //         // );
    //       }
    //       : undefined
    //   }
    //   // value={ }
    //   ChipProps={{ deleteIcon: <CloseIcon /> }}
    //   PopperComponent={CustomPopper}
    //   clearOnBlur={false}
    //   data-testid="placement-groups-select"
    //   // disableClearable={!clearable}
    //   disableCloseOnSelect={multiple}
    //   disablePortal={true}
    //   disabled={disabled}
    //   errorText={error?.[0].reason ?? errorText}
    //   id={id}
    //   inputValue={inputValue}
    //   label={label ?? 'Placement Group'}
    //   loading={isLoading || loading}
    //   noMarginTop={noMarginTop}
    //   onBlur={onBlur}
    //   onInputChange={(_, value) => setInputValue(value)}
    //   // onChange={(_, value) => onSelectionChange(value)}
    //   placeholder="Select a Placement Group"
    //   // options={placementGroups}
    //   popupIcon={<KeyboardArrowDownIcon />}
    //   sx={sx}
    // />
  );
};
