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
import { Tooltip } from 'src/components/Tooltip';
import { useFlags } from 'src/hooks/useFlags';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { RegionItem } from './RegionOption';
import { listOfDisabledRegions } from './disabledRegions';

import type { FakeRegion } from './disabledRegions';
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
  selectedId: null | string;
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
      .filter((disabledRegion) => {
        /**
         * Only display a fake region if the feature flag for it is enabled
         */
        const isFlagEnabled = flags[disabledRegion.featureFlag];
        /**
         * Don't display a fake region if it's included in the real /regions response
         */
        const isAlreadyIncluded = regions.some(
          (region) => region.id === disabledRegion.fakeRegion.id
        );
        /**
         * Don't display a fake region if it's excluded by the current path
         */
        const isExcludedByPath = disabledRegion.excludePaths?.some(
          (pathToExclude) => path.includes(pathToExclude)
        );

        return isFlagEnabled && !isAlreadyIncluded && !isExcludedByPath;
      })
      .map((disabledRegion) => disabledRegion.fakeRegion),
  ];

  return allRegions
    .map((region: Region) => {
      const group = getRegionCountryGroup(region);

      return {
        data: {
          country: region.country,
          disabledMessage: (region as FakeRegion).disabledMessage || null,
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
    selectedId,
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
    getSelectedRegionById(selectedId ?? '') ?? null
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
          <Tooltip
            disableFocusListener={Boolean(!option.data.disabledMessage)}
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
        value={getSelectedRegionById(selectedId || '') ?? null}
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

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&.MuiListItem-root[aria-disabled="true"]': {
    background: 'transparent !important',
    color: theme.palette.text.primary,
    cursor: 'not-allowed !important',
    pointerEvents: 'inherit !important',
  },
  '&.MuiListItem-root[aria-disabled="true"]:active': {
    pointerEvents: 'none !important',
  },
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
