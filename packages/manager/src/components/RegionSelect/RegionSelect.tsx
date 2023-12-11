import { visuallyHidden } from '@mui/utils';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { Tooltip } from 'src/components/Tooltip';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountAvailabilitiesQueryUnpaginated } from 'src/queries/accountAvailability';

import {
  SelectedIcon,
  StyledAutocompleteContainer,
  StyledFlagContainer,
  StyledListItem,
} from './RegionSelect.styles';
import { getRegionOptions, getSelectedRegionById } from './RegionSelect.utils';

import type {
  RegionSelectOption,
  RegionSelectProps,
} from './RegionSelect.types';
import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

/**
 * A specific select for regions.
 *
 * The RegionSelect automatically filters regions based on capability using its `currentCapability` prop. For example, if
 * `currentCapability="VPCs"`, only regions that support VPCs will appear in the RegionSelect dropdown. There is no need to
 * prefilter regions when passing them to the RegionSelect. See the description of `currentCapability` prop for more information.
 */
export const RegionSelect = React.memo((props: RegionSelectProps) => {
  const {
    currentCapability,
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

  const flags = useFlags();
  const {
    data: accountAvailability,
    isLoading: accountAvailabilityLoading,
  } = useAccountAvailabilitiesQueryUnpaginated(flags.dcGetWell);

  const regionFromSelectedId: RegionSelectOption | null =
    getSelectedRegionById({
      accountAvailabilityData: accountAvailability,
      currentCapability,
      regions,
      selectedRegionId: selectedId ?? '',
    }) ?? null;

  const [selectedRegion, setSelectedRegion] = React.useState<
    RegionSelectOption | null | undefined
  >(regionFromSelectedId);

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

  const options = React.useMemo(
    () =>
      getRegionOptions({
        accountAvailabilityData: accountAvailability,
        currentCapability,
        regions,
      }),
    [accountAvailability, currentCapability, regions]
  );

  return (
    <StyledAutocompleteContainer sx={{ width }}>
      <Autocomplete
        getOptionDisabled={(option: RegionSelectOption) =>
          Boolean(flags.dcGetWell) && Boolean(option.unavailable)
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
        renderOption={(props, option, { selected }) => {
          const isDisabledMenuItem =
            Boolean(flags.dcGetWell) && Boolean(option.unavailable);
          return (
            <Tooltip
              PopperProps={{
                sx: { '& .MuiTooltip-tooltip': { minWidth: 215 } },
              }}
              title={
                isDisabledMenuItem ? (
                  <>
                    There may be limited capacity in this region.{' '}
                    <Link to="https://www.linode.com/global-infrastructure/availability">
                      Learn more
                    </Link>
                    .
                  </>
                ) : (
                  ''
                )
              }
              disableFocusListener={!isDisabledMenuItem}
              disableHoverListener={!isDisabledMenuItem}
              disableTouchListener={!isDisabledMenuItem}
              enterDelay={200}
              enterNextDelay={200}
              enterTouchDelay={200}
              key={option.value}
            >
              <StyledListItem
                {...props}
                className={
                  isDisabledMenuItem
                    ? `${props.className} Mui-disabled`
                    : props.className
                }
                componentsProps={{
                  root: {
                    'data-qa-option': option.value,
                    'data-testid': option.value,
                  } as ListItemComponentsPropsOverrides,
                }}
                onClick={(e) =>
                  isDisabledMenuItem
                    ? e.preventDefault()
                    : props.onClick
                    ? props.onClick(e)
                    : null
                }
                aria-disabled={undefined}
              >
                <>
                  <Box alignItems="center" display="flex" flexGrow={1}>
                    <StyledFlagContainer>
                      <Flag country={option.data.country} />
                    </StyledFlagContainer>
                    {option.label}
                    {isDisabledMenuItem && (
                      <Box sx={visuallyHidden}>
                        Disabled option - There may be limited capacity in this
                        region. Learn more at
                        https://www.linode.com/global-infrastructure/availability.
                      </Box>
                    )}
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
        loading={accountAvailabilityLoading}
        loadingText="Loading regions..."
        noOptionsText="No results"
        options={options}
        placeholder="Select a Region"
        value={selectedRegion}
      />
    </StyledAutocompleteContainer>
  );
});
