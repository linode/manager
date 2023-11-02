/* eslint-disable perfectionist/sort-objects */
import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
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

import type { Country } from './utils';
import type { FlagSet } from 'src/featureFlags';

const NORTH_AMERICA = 'North America';

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
          flag: <Flag country={region.country as Lowercase<Country>} />,
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

export const getSelectedRegionById = (regionId: string, options: any) => {
  // const regions = options.flatMap((option) => option.options);
  // console.log('regions', regions);
  return options.find((option: any) => regionId === option.id);
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

    const options: any = React.useMemo(
      () => getRegionOptions(regions, flags, path),
      [flags, regions]
    );

    return (
      <div style={{ width }}>
        <Autocomplete
          // isOptionDisabled={(option: RegionItem) =>
          //   Boolean(option.disabledMessage)
          // }
          textFieldProps={{
            tooltipText: helperText,
          }}
          // components={{ Option: RegionOption, SingleValue: _SingleValue }}
          data-testid="region-select"
          disabled={disabled}
          groupBy={(option: RegionItem) => option.data.region}
          label={label ?? 'Region'}
          onChange={() => onChange}
          options={options}
          // placeholder="Select a Region"
          value={getSelectedRegionById(selectedID || '', options)}
          // {...restOfReactSelectProps}
        />
      </div>
    );
  }
);
