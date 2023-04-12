import Select, {
  BaseSelectProps,
  GroupType,
} from 'src/components/EnhancedSelect/Select';
import * as React from 'react';
import SingleValue from 'src/components/EnhancedSelect/components/SingleValue';
import { Region } from '@linode/api-v4/lib/regions';
import RegionOption, { RegionItem } from './RegionOption';
import { Flag } from 'src/components/Flag';
import {
  CONTINENT_CODE_TO_CONTINENT,
  COUNTRY_CODE_TO_CONTINENT_CODE,
  ContinentNames,
} from './utils';

interface Props extends Omit<BaseSelectProps, 'onChange'> {
  regions: Region[];
  handleSelection: (id: string) => void;
  selectedID: string | null;
  label?: string;
  helperText?: string;
  isClearable?: boolean;
  required?: boolean;
  width?: number;
}

export const selectStyles = {
  menuList: (base: any) => ({ ...base, maxHeight: `40vh !important` }),
};

type RegionGroup = ContinentNames | 'Other';

export const getRegionOptions = (regions: Region[]) => {
  const groups: Record<RegionGroup, RegionItem[]> = {
    'North America': [],
    Europe: [],
    Asia: [],
    'South America': [],
    Oceania: [],
    Africa: [],
    Antartica: [],
    Other: [],
  };

  for (const region of regions) {
    const country = region.country.toUpperCase();

    const continentCode =
      COUNTRY_CODE_TO_CONTINENT_CODE[
        country as keyof typeof COUNTRY_CODE_TO_CONTINENT_CODE
      ];

    const group = continentCode
      ? CONTINENT_CODE_TO_CONTINENT[continentCode] ?? 'Other'
      : 'Other';

    groups[group].push({
      label: `${region.label} (${region.id})`,
      value: region.id,
      flag: <Flag country={region.country} />,
      country: region.country,
    });
  }

  return Object.keys(groups).map((group: RegionGroup) => ({
    label: group,
    options: groups[group].sort(sortRegions),
  }));
};

export const getSelectedRegionById = (
  regionID: string,
  options: GroupType[]
) => {
  const regions = options.reduce(
    (accum, thisGroup) => [...accum, ...thisGroup.options],
    []
  );
  return regions.find((thisRegion) => regionID === thisRegion.value);
};

const sortRegions = (region1: RegionItem, region2: RegionItem) => {
  // By country desc so USA is on top
  if (region1.country > region2.country) {
    return -1;
  }
  if (region1.country < region2.country) {
    return 1;
  }
  // Alphabetically by display name, which is the city
  if (region1.label < region2.label) {
    return -1;
  }
  if (region1.label > region2.label) {
    return 1;
  }
  return 0;
};

export const RegionSelect = React.memo((props: Props) => {
  const {
    label,
    disabled,
    handleSelection,
    isClearable,
    helperText,
    regions,
    selectedID,
    styles,
    required,
    width,
    ...restOfReactSelectProps
  } = props;

  const onChange = React.useCallback(
    (selection: RegionItem | null) => {
      if (selection === null) {
        handleSelection('');
        return;
      }
      if (selection.disabledMessage) {
        // React Select's disabled state should prevent anything
        // from firing, this is basic paranoia.
        return;
      }
      handleSelection(selection?.value);
    },
    [handleSelection]
  );

  const options = React.useMemo(() => getRegionOptions(regions), [regions]);

  return (
    <div style={{ width }}>
      <Select
        isClearable={Boolean(isClearable)} // Defaults to false if the prop isn't provided
        value={getSelectedRegionById(selectedID || '', options) ?? ''}
        label={label ?? 'Region'}
        disabled={disabled}
        placeholder="Select a Region"
        options={options}
        onChange={onChange}
        components={{ Option: RegionOption, SingleValue }}
        isOptionDisabled={(option: RegionItem) =>
          Boolean(option.disabledMessage)
        }
        styles={styles || selectStyles}
        textFieldProps={{
          tooltipText: helperText,
        }}
        required={required}
        {...restOfReactSelectProps}
      />
    </div>
  );
});
