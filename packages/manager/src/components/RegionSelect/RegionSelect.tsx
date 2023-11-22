import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { List } from 'src/components/List';
import { Tooltip } from 'src/components/Tooltip';
import { useFlags } from 'src/hooks/useFlags';

import {
  GroupHeader,
  SelectedIcon,
  StyledFlagContainer,
  StyledLParentListItem,
  StyledListItem,
} from './RegionSelect.styles';
import { getRegionOptions, getSelectedRegionById } from './RegionSelect.utils';

import type {
  RegionSelectOption,
  RegionSelectProps,
} from './RegionSelect.types';
import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

export const RegionSelect = React.memo((props: RegionSelectProps) => {
  const {
    disabled,
    errorText,
    handleSelection,
    helperText,
    isClearable,
    label,
    regions,
    required,
    selectedId,
    width,
  } = props;

  const regionFromSelectedId: RegionSelectOption | null =
    getSelectedRegionById(regions, selectedId ?? '') ?? null;

  const [selectedRegion, setSelectedRegion] = React.useState<
    RegionSelectOption | null | undefined
  >(regionFromSelectedId);
  const flags = useFlags();
  const location = useLocation();
  const path = location.pathname;

  const handleRegionChange = (selection: RegionSelectOption) => {
    setSelectedRegion(selection);
    handleSelection(selection?.value);
  };

  React.useEffect(() => {
    if (selectedId) {
      setSelectedRegion(regionFromSelectedId);
    } else {
      // We need to reset the state when create types change
      setSelectedRegion(null);
    }
  }, [selectedId]);

  const options = React.useMemo(() => getRegionOptions(regions, flags, path), [
    flags,
    path,
    regions,
  ]);

  return (
    <Box sx={{ width }}>
      <Autocomplete
        getOptionDisabled={(option: RegionSelectOption) =>
          Boolean(option.data.disabledMessage)
        }
        isOptionEqualToValue={(
          option: RegionSelectOption,
          { value }: RegionSelectOption
        ) => option.value === value}
        onChange={(_, selectedOption: RegionSelectOption) => {
          handleRegionChange(selectedOption);
        }}
        onKeyDown={() => {
          setSelectedRegion(null);
        }}
        renderGroup={(params) => (
          <StyledLParentListItem key={params.key}>
            <GroupHeader data-qa-region-select-group={params.group}>
              {params.group}
            </GroupHeader>
            <List>{params.children}</List>
          </StyledLParentListItem>
        )}
        renderOption={(props, option, { selected }) => {
          // The tooltip is likely to be removed for DC Get Well
          // Because the the way Autocomplete is implemented, we need to wrap the entire list item in the tooltip, otherwise the tooltip will not show.
          // This is the reason for disabling event listeners on the tooltip when there is no disabled message.
          // It's probably superfluous, but won't hurt either.
          const isDisabledMenuItem = Boolean(option.data.disabledMessage);
          return (
            <Tooltip
              disableFocusListener={!isDisabledMenuItem}
              disableHoverListener={!isDisabledMenuItem}
              disableTouchListener={!isDisabledMenuItem}
              enterDelay={500}
              enterTouchDelay={500}
              key={option.value}
              title={option.data.disabledMessage ?? ''}
            >
              <StyledListItem
                {...props}
                componentsProps={{
                  root: {
                    'data-qa-option': option.value,
                    'data-testid': option.value,
                  } as ListItemComponentsPropsOverrides,
                }}
              >
                <>
                  <Box alignItems="center" display="flex" flexGrow={1}>
                    <StyledFlagContainer>
                      <Flag country={option.data.country} />
                    </StyledFlagContainer>
                    {option.label}{' '}
                    {Boolean(option.data.disabledMessage) && ' (Not available)'}
                  </Box>
                  {selected && <SelectedIcon visible={selected} />}
                </>
              </StyledListItem>
            </Tooltip>
          );
        }}
        textFieldProps={{
          InputProps: {
            required,
            startAdornment: selectedRegion && (
              <StyledFlagContainer>
                <Flag country={selectedRegion?.data.country} />
              </StyledFlagContainer>
            ),
          },
          tooltipText: helperText,
        }}
        autoHighlight
        clearOnBlur
        data-testid="region-select"
        disableClearable={!isClearable}
        disabled={disabled}
        errorText={errorText}
        groupBy={(option: RegionSelectOption) => option.data.region}
        label={label ?? 'Region'}
        noOptionsText="No results"
        options={options}
        placeholder="Select a Region"
        value={selectedRegion}
      />
    </Box>
  );
});
