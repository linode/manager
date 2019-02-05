import * as React from 'react';
import { compose } from 'recompose';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';
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
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: any) => void;
  value: any;
  shouldOnlyIncludeRegionsWithBlockStorage?: boolean;
}

type CombinedProps = Props & WithRegions & WithStyles<ClassNames>;

export const RegionSelect: React.StatelessComponent<CombinedProps> = props => {
  const {
    error,
    onChange,
    onBlur,
    regionsData,
    value,
    name,
    shouldOnlyIncludeRegionsWithBlockStorage
  } = props;

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="region" disableAnimation shrink={true}>
        Region
      </InputLabel>
      <Select
        value={value}
        name={name}
        placeholder="All Regions"
        onChange={onChange}
        onBlur={onBlur}
        inputProps={{ name: 'region', id: 'region' }}
        data-qa-select-region
      >
        <MenuItem key="none" value="none">
          All Regions
        </MenuItem>
        {regionsData.map(eachRegion => {
          const shouldDisableRegion =
            shouldOnlyIncludeRegionsWithBlockStorage &&
            !doesRegionSupportBlockStorage(eachRegion.id);
          return (
            <MenuItem
              data-qa-attach-to-region={eachRegion.id}
              key={eachRegion.id}
              value={eachRegion.id}
              disabled={shouldDisableRegion}
              tooltip={shouldDisableRegion ? regionSupportMessage : ''}
            >
              {formatRegion('' + eachRegion.id)}
            </MenuItem>
          );
        })}
      </Select>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
};

const styled = withStyles(styles);

const withRegions = regionsContainer();

const enhanced = compose<CombinedProps, Props>(
  styled,
  withRegions
);

export default enhanced(RegionSelect);
