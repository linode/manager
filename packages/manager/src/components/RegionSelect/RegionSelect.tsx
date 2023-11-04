import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { List } from 'src/components/List';
import { Tooltip } from 'src/components/Tooltip';
import { useFlags } from 'src/hooks/useFlags';

import { RegionItem } from './RegionOption';
import {
  GroupHeader,
  SelectedIcon,
  StyledFlagContainer,
  StyledListItem,
} from './RegionSelect.styles';
import { getRegionOptions, getSelectedRegionById } from './RegionSelect.utils';

import type { RegionSelectProps } from './RegionSelect.types';
import type { Country } from './RegionSelect.types';
import type { OptionType } from './RegionSelect.types';

export const RegionSelect = React.memo((props: RegionSelectProps) => {
  const {
    disabled,
    handleSelection,
    helperText,
    isClearable,
    label,
    regions,
    required,
    selectedId,
    width,
  } = props;

  const [selectedRegion, setSelectedRegion] = React.useState<OptionType | null>(
    getSelectedRegionById(regions, selectedId ?? '') ?? null
  );
  const flags = useFlags();
  const location = useLocation();
  const path = location.pathname;

  const handleRegionChange = (selection: OptionType) => {
    setSelectedRegion(selection);
    handleSelection(selection?.value);
  };

  const options: any = React.useMemo(
    () => getRegionOptions(regions, flags, path),
    [flags, path, regions]
  );

  return (
    <Box sx={{ width }}>
      <Autocomplete
        getOptionDisabled={(option: OptionType) =>
          Boolean(option.data.disabledMessage)
        }
        isOptionEqualToValue={(option: RegionItem, { value }: RegionItem) =>
          option.value === value
        }
        onChange={(_, selectedRegion: OptionType) => {
          handleRegionChange(selectedRegion);
        }}
        renderGroup={(params) => (
          <li key={params.key}>
            <GroupHeader>{params.group}</GroupHeader>
            <List>{params.children}</List>
          </li>
        )}
        renderOption={(props, option, { selected }) => (
          // The tooltip is likely to be removed for DC Get Well
          // Because the the way Autocomplete is implemented, we need to wrap the
          // entire list item in the tooltip, otherwise the tooltip will not show
          // This is the reason for disabling event listeners on the tooltip
          // when there is no disabled message.
          <Tooltip
            disableFocusListener={Boolean(!option.data.disabledMessage)}
            disableHoverListener={Boolean(!option.data.disabledMessage)}
            disableTouchListener={Boolean(!option.data.disabledMessage)}
            enterDelay={500}
            enterTouchDelay={500}
            title={option.data.disabledMessage ?? ''}
          >
            <StyledListItem {...props}>
              {Boolean(option.data.disabledMessage) ? (
                <Box alignItems="center" display="flex" flexGrow={1}>
                  <StyledFlagContainer>
                    <Flag country={option.data.country} />
                  </StyledFlagContainer>
                  {option.label} (Not available)
                </Box>
              ) : (
                <>
                  <Box alignItems="center" display="flex" flexGrow={1}>
                    <StyledFlagContainer>
                      <Flag country={option.data.country} />
                    </StyledFlagContainer>
                    {option.label}
                  </Box>
                  <SelectedIcon visible={selected} />
                </>
              )}
            </StyledListItem>
          </Tooltip>
        )}
        textFieldProps={{
          InputProps: {
            required,
            startAdornment: selectedRegion && (
              <StyledFlagContainer>
                <Flag
                  country={selectedRegion?.data.country as Lowercase<Country>}
                />
              </StyledFlagContainer>
            ),
          },
          tooltipText: helperText,
        }}
        data-testid="region-select"
        disableClearable={!isClearable}
        disabled={disabled}
        groupBy={(option: RegionItem) => option.data.region}
        label={label ?? 'Region'}
        options={options}
        placeholder="Select a Region"
        value={getSelectedRegionById(regions, selectedId || '') ?? null}
      />
    </Box>
  );
});
