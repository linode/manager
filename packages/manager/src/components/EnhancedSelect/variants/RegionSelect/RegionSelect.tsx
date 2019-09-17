import CA from 'flag-icon-css/flags/4x3/ca.svg';
import DE from 'flag-icon-css/flags/4x3/de.svg';
import UK from 'flag-icon-css/flags/4x3/gb.svg';
import IN from 'flag-icon-css/flags/4x3/in.svg';
import JP from 'flag-icon-css/flags/4x3/jp.svg';
import SG from 'flag-icon-css/flags/4x3/sg.svg';
import US from 'flag-icon-css/flags/4x3/us.svg';
import { Region } from 'linode-js-sdk/lib/regions';
import { groupBy, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Select, {
  BaseSelectProps,
  GroupType
} from 'src/components/EnhancedSelect/Select';

import RegionOption, { RegionItem } from './RegionOption';

export interface ExtendedRegion extends Region {
  display: string;
}

interface Props extends Omit<BaseSelectProps, 'onChange'> {
  regions: ExtendedRegion[];
  handleSelection: (id: string) => void;
  selectedID: string | null;
}

export const flags = {
  us: () => <US width="32" height="24" viewBox="0 0 720 480" />,
  sg: () => <SG width="32" height="24" viewBox="0 0 640 480" />,
  jp: () => (
    <JP
      width="32"
      height="24"
      viewBox="0 0 640 480"
      style={{ backgroundColor: '#fff' }}
    />
  ),
  uk: () => <UK width="32" height="24" viewBox="0 0 640 480" />,
  eu: () => <UK width="32" height="24" viewBox="0 0 640 480" />,
  de: () => <DE width="32" height="24" viewBox="0 0 720 480" />,
  ca: () => <CA width="32" height="24" viewBox="0 0 640 480" />,
  in: () => <IN width="32" height="24" viewBox="0 0 640 480" />
};

export const selectStyles = {
  menuList: (base: any) => ({ ...base, maxHeight: `40vh !important` })
};
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& svg': {
      '& g': {
        // Super hacky fix for Firefox rendering of some flag icons that had a clip-path property.
        clipPath: 'none !important' as 'none'
      }
    }
  }
}));

export const getRegionOptions = (regions: ExtendedRegion[]) => {
  const groupedRegions = groupBy<ExtendedRegion>(thisRegion => {
    if (thisRegion.country.match(/(us|ca)/)) {
      return 'North America';
    }
    if (thisRegion.country.match(/(de|uk|eu)/)) {
      return 'Europe';
    }
    if (thisRegion.country.match(/(jp|sg|in)/)) {
      return 'Asia';
    }
    return 'Other';
  }, regions);
  return ['North America', 'Europe', 'Asia', 'Other'].reduce(
    (accum, thisGroup) => {
      if (
        !groupedRegions[thisGroup] ||
        groupedRegions[thisGroup].length === 0
      ) {
        return accum;
      }
      return [
        ...accum,
        {
          label: thisGroup,
          options: groupedRegions[thisGroup]
            .map(thisRegion => ({
              label: thisRegion.display,
              value: thisRegion.id,
              flag: pathOr(
                () => null,
                [thisRegion.country.toLocaleLowerCase()],
                flags
              ),
              country: thisRegion.country
            }))
            .sort(sortRegions)
        }
      ];
    },
    []
  );
};

export const getSelectedRegionById = (
  regionID: string,
  options: GroupType[]
) => {
  const regions = options.reduce(
    (accum, thisGroup) => [...accum, ...thisGroup.options],
    []
  );
  return regions.find(thisRegion => regionID === thisRegion.value);
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

const SelectRegionPanel: React.FC<Props> = props => {
  const {
    disabled,
    handleSelection,
    regions,
    selectedID,
    styles,
    ...restOfReactSelectProps
  } = props;

  const classes = useStyles();

  const options = getRegionOptions(regions);

  return (
    <div className={classes.root}>
      <Select
        isClearable={false}
        value={getSelectedRegionById(selectedID || '', options)}
        label="Select a region"
        disabled={disabled}
        placeholder="Regions"
        options={options}
        onChange={(selection: RegionItem) => handleSelection(selection.value)}
        components={{ Option: RegionOption }}
        styles={styles || selectStyles}
        {...restOfReactSelectProps}
      />
    </div>
  );
};

export default compose<Props, Props>(React.memo)(SelectRegionPanel);
