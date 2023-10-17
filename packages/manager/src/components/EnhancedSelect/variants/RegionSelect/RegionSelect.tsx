/* eslint-disable perfectionist/sort-objects */
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import Select, {
  BaseSelectProps,
  GroupType,
  Item,
} from 'src/components/EnhancedSelect/Select';
import { _SingleValue } from 'src/components/EnhancedSelect/components/SingleValue';
import { Flag } from 'src/components/Flag';
import { useFlags } from 'src/hooks/useFlags';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { RegionItem, RegionOption } from './RegionOption';
import { listOfDisabledRegions } from './disabledRegions';
import { ContinentNames, Country } from './utils';

import type { FakeRegion } from './disabledRegions';
import type { Region } from '@linode/api-v4/lib/regions';
import type { FlagSet } from 'src/featureFlags';

interface Props<IsClearable extends boolean>
  extends Omit<
    BaseSelectProps<Item<string>, false, IsClearable>,
    'label' | 'onChange'
  > {
  handleSelection: (id: string) => void;
  helperText?: string;
  label?: string;
  regions: Region[];
  required?: boolean;
  selectedID: null | string;
  width?: number;
}

export const selectStyles = {
  menuList: (base: any) => ({ ...base, maxHeight: `40vh !important` }),
};

type RegionGroup = 'Other' | ContinentNames;

export const getRegionOptions = (
  regions: Region[],
  flags: FlagSet,
  path: string
) => {
  // Note: Do not re-order this list even though ESLint is complaining.
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

  for (const region of allRegions) {
    const group = getRegionCountryGroup(region);

    groups[group].push({
      country: region.country,
      disabledMessage: (region as FakeRegion).disabledMessage || null,
      flag: <Flag country={region.country as Lowercase<Country>} />,
      label: `${region.label} (${region.id})`,
      value: region.id,
    });
  }

  return Object.keys(groups).map((group: RegionGroup) => ({
    label: group,
    options: groups[group].sort(sortRegions),
  }));
};

export const getSelectedRegionById = (
  regionID: string,
  options: GroupType<string>[]
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

export const RegionSelect = React.memo(
  <IsClearable extends boolean>(props: Props<IsClearable>) => {
    const {
      disabled,
      handleSelection,
      helperText,
      isClearable,
      label,
      regions,
      required,
      selectedID,
      styles,
      width,
      ...restOfReactSelectProps
    } = props;

    const flags = useFlags();
    const location = useLocation();
    const path = location.pathname;
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

    const options = React.useMemo(
      () => getRegionOptions(regions, flags, path),
      [flags, regions]
    );

    return (
      <div style={{ width }}>
        <Select
          isOptionDisabled={(option: RegionItem) =>
            Boolean(option.disabledMessage)
          }
          textFieldProps={{
            tooltipText: helperText,
          }}
          components={{ Option: RegionOption, SingleValue: _SingleValue }}
          data-testid="region-select"
          disabled={disabled}
          isClearable={Boolean(isClearable)} // Defaults to false if the prop isn't provided
          label={label ?? 'Region'}
          onChange={onChange}
          options={options}
          placeholder="Select a Region"
          required={required}
          styles={styles || selectStyles}
          value={getSelectedRegionById(selectedID || '', options) ?? null}
          {...restOfReactSelectProps}
        />
      </div>
    );
  }
);
