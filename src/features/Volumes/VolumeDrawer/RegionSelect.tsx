import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';
import { withRegions } from 'src/context/regions';
import { formatRegion } from 'src/utilities';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  error?: string;
  name: string;
  handleChange: any;
  onBlur: any;
  value: any;
}

interface RegionsContextProps {
  regions?: Linode.Region[];
}

type CombinedProps = Props & RegionsContextProps & WithStyles<ClassNames>;

const RegionSelect: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    error,
    handleChange,
    onBlur,
    regions,
    value,
    name,
  } = props;

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="region" disableAnimation shrink={true} >
        Region
      </InputLabel>
      <Select
        value={value}
        name={name}
        placeholder='Select a Region'
        onChange={handleChange}
        onBlur={onBlur}
        inputProps={{ name: 'region', id: 'region' }}
        data-qa-select-region
      >
        <MenuItem key="none" value="none">Select a Region</MenuItem>
        {regions && regions.map(eachRegion =>
          (<MenuItem
            key={eachRegion.id}
            value={eachRegion.id}
            data-qa-attach-to-region={eachRegion.id}
          >
            {formatRegion('' + eachRegion.id)}
          </MenuItem>)
        )}
      </Select>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
};

const styled = withStyles(styles);

const regionsContext = withRegions(({ data }) => ({
  regions: data,
}))

export default regionsContext(styled(RegionSelect)) as any;
