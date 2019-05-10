import * as React from 'react';
import { compose } from 'recompose';
import FormHelperText from 'src/components/core/FormHelperText';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import regionsContainer, {
  DefaultProps as WithRegions
} from 'src/containers/regions.container';
import { formatRegion } from 'src/utilities';
import { doesRegionSupportBlockStorage } from 'src/utilities/doesRegionSupportBlockStorage';
export const regionSupportMessage =
  'This region does not currently support Block Storage.';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});
interface Props {
  error?: string;
  name: string;
  onChange: (value: string) => void;
  onBlur: (e: any) => void;
  value: any;
  shouldOnlyDisplayRegionsWithBlockStorage?: boolean;
  disabled?: boolean;
}

type CombinedProps = Props & WithRegions & WithStyles<ClassNames>;

export const RegionSelect: React.StatelessComponent<CombinedProps> = props => {
  const {
    error,
    onChange,
    onBlur,
    regionsData,
    shouldOnlyDisplayRegionsWithBlockStorage: shouldOnlyDisplayRegionsWithBlockStorage,
    disabled
  } = props;

  const regions = shouldOnlyDisplayRegionsWithBlockStorage
    ? regionsData.filter(region => doesRegionSupportBlockStorage(region.id))
    : regionsData;

  const regionList = regions.map(eachRegion => {
    const label = formatRegion('' + eachRegion.id);
    return { label, value: eachRegion.id };
  });

  return (
    <>
      <Select
        options={regionList}
        placeholder="All Regions"
        onChange={(item: Item<string>) => onChange(item.value)}
        onBlur={onBlur}
        data-qa-select-region
        disabled={disabled}
        label="Region"
        isClearable={false}
        errorText={error}
      />
      {!error && shouldOnlyDisplayRegionsWithBlockStorage && (
        <FormHelperText data-qa-volume-region>
          The datacenter where the new volume should be created. Only regions
          supporting block storage are displayed.
        </FormHelperText>
      )}
    </>
  );
};

const styled = withStyles(styles);

const withRegions = regionsContainer();

const enhanced = compose<CombinedProps, Props>(
  styled,
  withRegions
);

export default enhanced(RegionSelect);
