import { Typography } from '@mui/material';
import * as React from 'react';

import DistributedRegion from 'src/assets/icons/entityIcons/distributed-region.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useFlags } from 'src/hooks/useFlags';
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

  const flags = useFlags();

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
    // We need to reset the state when create types change
    setSelectedRegion(null);
  }, [regions]);

  const options = React.useMemo(
    () =>
      getRegionOptions({
        accountAvailabilityData: accountAvailability,
        currentCapability,
        flags,
        handleDisabledRegion,
        regionFilter,
        regions,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      accountAvailability,
      currentCapability,
      handleDisabledRegion,
      regions,
      regionFilter,
      flags.gecko2,
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
        renderOption={(props, option) => {
          return (
            <RegionOption
              displayDistributedRegionIcon={
                regionFilter !== 'core' &&
                (option.site_type === 'distributed' ||
                  option.site_type === 'edge') &&
                flags.gecko2?.enabled &&
                !flags.gecko2.ga
              }
              flags={flags}
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
              (selectedRegion?.site_type === 'distributed' ||
                selectedRegion?.site_type === 'edge') &&
              flags.gecko2?.enabled &&
              !flags.gecko2.ga && (
                <TooltipIcon
                  icon={<DistributedRegion />}
                  status="other"
                  sxTooltipIcon={sxDistributedRegionIcon}
                  text="This region is a distributed region."
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
            Indicates a distributed region.{' '}
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
