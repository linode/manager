import CA from 'flag-icon-css/flags/4x3/ca.svg';
import DE from 'flag-icon-css/flags/4x3/de.svg';
import UK from 'flag-icon-css/flags/4x3/gb.svg';
import IN from 'flag-icon-css/flags/4x3/in.svg';
import JP from 'flag-icon-css/flags/4x3/jp.svg';
import SG from 'flag-icon-css/flags/4x3/sg.svg';
import US from 'flag-icon-css/flags/4x3/us.svg';
import { groupBy, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { GroupType, Item } from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { extendedDCDisplayNames } from 'src/constants';

import RegionOption from './RegionOption';

const flags = {
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
  de: () => <DE width="32" height="24" viewBox="0 0 720 480" />,
  ca: () => <CA width="32" height="24" viewBox="0 0 640 480" />,
  in: () => <IN width="32" height="24" viewBox="0 0 640 480" />
};

export const selectStyles = {
  // @Bailly this matches the comps but I'm not sure how I feel about it.
  menuList: (base: any) => ({ ...base, maxHeight: `700px !important` })
};

export interface ExtendedRegion extends Linode.Region {
  display: string;
}

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(3),
      padding: theme.spacing(3)
    }
  });

interface Props {
  regions: ExtendedRegion[];
  copy?: string;
  error?: string;
  handleSelection: (id: string) => void;
  selectedID?: string;
  disabled?: boolean;
}

export const getRegionOptions = (regions: ExtendedRegion[]) => {
  const groupedRegions = groupBy<ExtendedRegion>(thisRegion => {
    if (thisRegion.country.match(/(us|ca)/)) {
      return 'North America';
    }
    if (thisRegion.country.match(/(de|uk)/)) {
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
              label: pathOr(
                thisRegion.display,
                [thisRegion.id],
                extendedDCDisplayNames
              ),
              value: thisRegion.id,
              data: {
                flag: pathOr(
                  () => null,
                  [thisRegion.country.toLocaleLowerCase()],
                  flags
                )
              }
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

const sortRegions = (region1: Item<string>, region2: Item<string>) => {
  if (region1.label < region2.label) {
    return -1;
  }
  if (region1.label > region2.label) {
    return 1;
  }
  return 0;
};

const SelectRegionPanel: React.FC<Props & WithStyles<ClassNames>> = props => {
  const {
    classes,
    copy,
    disabled,
    error,
    handleSelection,
    regions,
    selectedID
  } = props;

  if (props.regions.length === 0) {
    return null;
  }

  const options = getRegionOptions(regions);

  return (
    <>
      <Paper className={classes.root}>
        <Typography variant="h2">Region</Typography>
        {copy && (
          <Typography variant="body1">
            {copy}
            {` `}
            <a target="_blank" href="https://www.linode.com/speedtest">
              Use our speedtest page
            </a>
            {` `}
            to find the best region for your current location.
          </Typography>
        )}
        <Select
          isClearable={false}
          value={getSelectedRegionById(selectedID || '', options)}
          label="Select a region"
          errorText={error}
          disabled={disabled}
          placeholder="Regions"
          options={options}
          onChange={(selection: Item<string>) =>
            handleSelection(selection.value)
          }
          components={{ Option: RegionOption }}
          styleOverrides={selectStyles}
        />
      </Paper>
    </>
  );
};

const styled = withStyles(styles);

export default compose<
  Props & WithStyles<ClassNames>,
  Props & RenderGuardProps
>(
  RenderGuard,
  styled
)(SelectRegionPanel);
