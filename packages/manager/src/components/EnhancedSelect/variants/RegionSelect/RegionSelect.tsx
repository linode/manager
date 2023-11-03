import { Region } from '@linode/api-v4/lib/regions';
import DoneIcon from '@mui/icons-material/Done';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { useFlags } from 'src/hooks/useFlags';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { RegionItem } from './RegionOption';
import { listOfDisabledRegions } from './disabledRegions';

import type { Country } from './utils';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';
import type { FlagSet } from 'src/featureFlags';

const NORTH_AMERICA = 'North America';

interface OptionType {
  data?: any;
  label: string;
  value: string;
}

interface RegionSelectProps
  extends Omit<
    EnhancedAutocompleteProps<OptionType, false>,
    'label' | 'onChange' | 'options'
  > {
  handleSelection: (id: string) => void;
  helperText?: string;
  isClearable?: boolean;
  label?: string;
  regions: Region[];
  required?: boolean;
  selectedID: null | string;
  width?: number;
}

export const selectStyles = {
  menuList: (base: any) => ({ ...base, maxHeight: `40vh !important` }),
};

export const getRegionOptions = (
  regions: Region[],
  flags: FlagSet,
  path: string
) => {
  const allRegions = [
    ...regions,
    ...listOfDisabledRegions
      .filter(
        (disabledRegion) =>
          // Only display a fake region if the feature flag for it is enabled
          // We may want to consider modifying this logic if we end up with disabled regions that don't rely on feature flags
          flags[disabledRegion.featureFlag] &&
          // Don't display a fake region if it's included in the real /regions response
          !regions.some(
            (region) => region.id === disabledRegion.fakeRegion.id
          ) &&
          // Don't display a fake region if it's excluded by the current path
          !disabledRegion.excludePaths?.some((pathToExclude) =>
            path.includes(pathToExclude)
          )
      )
      .map((disabledRegion) => disabledRegion.fakeRegion),
  ];

  // for (const region of allRegions) {
  //   const group = getRegionCountryGroup(region);

  //   groups[group].push({
  //     country: region.country,
  //     disabledMessage: hasUserAccessToDisabledRegions
  //       ? undefined
  //       : listOfDisabledRegions.find(
  //           (disabledRegion) => disabledRegion.fakeRegion.id === region.id
  //         )?.disabledMessage,
  //     flag: <Flag country={region.country as Lowercase<Country>} />,
  //     label: `${region.label} (${region.id})`,
  //     value: region.id,
  //   });
  // }
  return allRegions
    .map((region: Region) => {
      const group = getRegionCountryGroup(region);

      return {
        data: {
          country: region.country,
          region: group,
        },
        label: `${region.label} (${region.id})`,
        value: region.id,
      };
    })
    .sort((region1, region2) => {
      // North America group comes first
      if (
        region1.data.region === NORTH_AMERICA &&
        region2.data.region !== NORTH_AMERICA
      ) {
        return -1;
      }
      if (
        region1.data.region !== NORTH_AMERICA &&
        region2.data.region === NORTH_AMERICA
      ) {
        return 1;
      }

      // Everything else is sorted alphabetically by region
      if (region1.data.region < region2.data.region) {
        return -1;
      }
      if (region1.data.region > region2.data.region) {
        return 1;
      }
      return 0;
    });
};

export const RegionSelect = React.memo((props: RegionSelectProps) => {
  const {
    disabled,
    handleSelection,
    helperText,
    isClearable,
    label,
    regions,
    required,
    selectedID,
    width,
  } = props;

  const getSelectedRegionById = (
    selectedRegionId: string
  ): OptionType | undefined => {
    const selectedRegion: Region | undefined = regions.find(
      (thisRegion) => selectedRegionId === thisRegion.id
    );

    const group = getRegionCountryGroup(selectedRegion);

    if (!selectedRegion) {
      return undefined;
    }

    return {
      data: {
        country: selectedRegion?.country,
        region: group,
      },
      label: `${selectedRegion.label} (${selectedRegion.id})`,
      value: selectedRegion.id,
    };
  };

  const [selectedRegion, setSelectedRegion] = React.useState<OptionType | null>(
    getSelectedRegionById(selectedID ?? '') ?? null
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
        getOptionDisabled={(option: RegionItem) =>
          Boolean(option.disabledMessage)
        }
        isOptionEqualToValue={(option: RegionItem, value: RegionItem) =>
          option.value === value.value
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
          <ListItem {...props}>
            <Box alignItems="center" display="flex" flexGrow={1}>
              <StyledFlagContainer>
                <Flag country={option.data.country} />
              </StyledFlagContainer>
              {option.label}
            </Box>
            <SelectedIcon visible={selected} />
          </ListItem>
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
        value={getSelectedRegionById(selectedID || '') ?? null}
      />
    </Box>
  );
});

const GroupHeader = styled('div')(({ theme }) => ({
  color: theme.color.headline,
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  padding: '15px 4px 4px 10px',
  textTransform: 'initial',
}));

const StyledFlagContainer = styled('div')(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const SelectedIcon = styled(DoneIcon, {
  label: 'SelectedIcon',
  shouldForwardProp: (prop) => prop != 'visible',
})<{ visible: boolean }>(({ visible }) => ({
  height: 17,
  marginLeft: '-2px',
  marginRight: '5px',
  visibility: visible ? 'visible' : 'hidden',
  width: 17,
}));
