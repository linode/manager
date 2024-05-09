import { Typography } from '@mui/material';
import * as React from 'react';

import DistributedRegion from 'src/assets/icons/entityIcons/distributed-region.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useAllAccountAvailabilitiesQuery } from 'src/queries/account/availability';

import { RegionOption } from './RegionOption';
import {
  StyledAutocompleteContainer,
  StyledDistributedRegionBox,
  StyledFlagContainer,
  sxDistributedRegionIcon,
} from './RegionSelect.styles';
import { getRegionOptions, getSelectedRegionById } from './RegionSelect.utils';

import type {
  RegionSelectOption,
  RegionSelectProps,
} from './RegionSelect.types';

/**
 * A specific select for regions.
 *
 * The RegionSelect automatically filters regions based on capability using its `currentCapability` prop. For example, if
 * `currentCapability="VPCs"`, only regions that support VPCs will appear in the RegionSelect dropdown. Distributed regions are filtered based on the `regionFilter` prop.
 * There is no need to pre-filter regions when passing them to the RegionSelect. See the description of `currentCapability` prop for more information.
 *
 * We do not display the selected check mark for single selects.
 */
export const RegionSelect = React.memo((props: RegionSelectProps) => {
  const {
    currentCapability,
    disabled,
    errorText,
    handleDisabledRegion,
    handleSelection,
    helperText,
    isClearable,
    label,
    regionFilter,
    regions,
    required,
    selectedId,
    showDistributedRegionIconHelperText,
    tooltipText,
    width,
  } = props;

  const {
    data: accountAvailability,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery();

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

  const handleRegionChange = (selection: RegionSelectOption | null) => {
    setSelectedRegion(selection);
    handleSelection(selection?.value || '');
  };

  React.useEffect(() => {
    if (selectedId) {
      setSelectedRegion(regionFromSelectedId);
    } else {
      // We need to reset the state when create types change
      setSelectedRegion(null);
    }
  }, [selectedId, regions]);

  const options = React.useMemo(
    () =>
      getRegionOptions({
        accountAvailabilityData: accountAvailability,
        currentCapability,
        handleDisabledRegion,
        regionFilter,
        regions,
      }),
    [
      accountAvailability,
      currentCapability,
      handleDisabledRegion,
      regions,
      regionFilter,
    ]
  );

  return (
    <StyledAutocompleteContainer sx={{ width }}>
      <Autocomplete
        getOptionDisabled={(option: RegionSelectOption) =>
          Boolean(option.disabledProps?.disabled)
        }
        isOptionEqualToValue={(
          option: RegionSelectOption,
          { value }: RegionSelectOption
        ) => option.value === value}
        onChange={(_, selectedOption: RegionSelectOption) => {
          handleRegionChange(selectedOption);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Tab') {
            setSelectedRegion(null);
            handleRegionChange(null);
          }
        }}
        renderOption={(props, option) => {
          return (
            <RegionOption
              displayDistributedRegionIcon={
                regionFilter !== 'core' && option.site_type === 'distributed'
              }
              key={option.value}
              option={option}
              props={props}
            />
          );
        }}
        sx={(theme) => ({
          [theme.breakpoints.up('md')]: {
            width: '416px',
          },
        })}
        textFieldProps={{
          ...props.textFieldProps,
          InputProps: {
            endAdornment: regionFilter !== 'core' &&
              selectedRegion?.site_type === 'distributed' && (
                <TooltipIcon
                  icon={<DistributedRegion />}
                  status="other"
                  sxTooltipIcon={sxDistributedRegionIcon}
                  text="This region is an distributed region."
                />
              ),
            required,
            startAdornment: selectedRegion && (
              <StyledFlagContainer>
                <Flag country={selectedRegion?.data.country} />
              </StyledFlagContainer>
            ),
          },
          tooltipText,
        }}
        autoHighlight
        clearOnBlur
        data-testid="region-select"
        disableClearable={!isClearable}
        disabled={disabled}
        errorText={errorText}
        groupBy={(option: RegionSelectOption) => option.data.region}
        helperText={helperText}
        label={label ?? 'Region'}
        loading={accountAvailabilityLoading}
        loadingText="Loading regions..."
        noOptionsText="No results"
        options={options}
        placeholder="Select a Region"
        value={selectedRegion}
      />
      {showDistributedRegionIconHelperText && ( // @TODO Gecko Beta: Add docs link
        <StyledDistributedRegionBox>
          <DistributedRegion />
          <Typography
            data-testid="region-select-distributed-region-text"
            sx={{ alignSelf: 'center', textWrap: 'nowrap' }}
          >
            {' '}
            Indicates an distributed region.{' '}
            <Link
              aria-label="Learn more about Akamai distributed regions"
              to="#"
            >
              Learn more
            </Link>
            .
          </Typography>
        </StyledDistributedRegionBox>
      )}
    </StyledAutocompleteContainer>
  );
});
