import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import EdgeServer from 'src/assets/icons/entityIcons/edge-server.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountAvailabilitiesQueryUnpaginated } from 'src/queries/accountAvailability';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import { RegionOption } from './RegionOption';
import {
  StyledAutocompleteContainer,
  StyledFlagContainer,
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
  const location = useLocation();
  const createType = getQueryParamFromQueryString(location.search, 'type');

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
  }, [selectedId]);

  // Hide edge sites from Marketplace, Create NodeBalancer, Create LKE, and Image Upload
  const unsupportedEdgeEntities =
    ['Images', 'One-Click'].includes(createType) ||
    [
      '/images/create/upload',
      '/kubernetes/create',
      '/nodebalancers/create',
    ].includes(location.pathname);
  const geckoEnabled = Boolean(flags.gecko && !unsupportedEdgeEntities);

  const options = React.useMemo(
    () =>
      getRegionOptions({
        accountAvailabilityData: accountAvailability,
        currentCapability,
        hideEdgeServers: !geckoEnabled,
        regions,
      }),
    [accountAvailability, currentCapability, regions, geckoEnabled]
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
        onKeyDown={(e) => {
          if (e.key !== 'Tab') {
            setSelectedRegion(null);
            handleRegionChange(null);
          }
        }}
        renderOption={(props, option) => {
          return (
            <RegionOption
              displayEdgeServerIcon={
                geckoEnabled && option.site_type === 'edge'
              }
              key={option.value}
              option={option}
              props={props}
            />
          );
        }}
        textFieldProps={{
          InputProps: {
            endAdornment: geckoEnabled &&
              selectedRegion?.site_type === 'edge' && (
                <TooltipIcon
                  icon={<EdgeServer />}
                  status="other"
                  sxTooltipIcon={sxIcon}
                  text="This region is an edge server."
                />
              ),
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
        sx={{ minWidth: 416 }}
        value={selectedRegion}
      />
      {geckoEnabled && (
        <StyledBox>
          <EdgeServer />
          <Typography>
            {' '}
            Indicates an Edge server region. <Link to="#">Learn more</Link>
          </Typography>
        </StyledBox>
      )}
    </StyledAutocompleteContainer>
    // @TODO Gecko MVP: Add docs link
  );
});

const sxIcon = {
  '& svg': {
    color: 'inherit !important',
    height: 21,
    width: 24,
  },
  '&:hover': {
    color: 'inherit',
  },
  color: 'inherit',
  padding: 0,
};

const StyledBox = styled(Box, { label: 'StyledBox' })(({ theme }) => ({
  '& svg': {
    height: 21,
    marginLeft: 8,
    marginRight: 8,
    width: 24,
  },
  alignSelf: 'end',
  color: 'inherit',
  display: 'flex',
  marginLeft: 8,
  padding: '8px 0',
}));
