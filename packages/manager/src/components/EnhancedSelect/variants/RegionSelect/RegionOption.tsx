import classNames from 'classnames';
import * as React from 'react';
import { OptionProps } from 'react-select/lib/components/Option';
import Option from 'src/components/EnhancedSelect/components/Option';
import { Item } from 'src/components/EnhancedSelect/Select';

import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1)
  },
  focused: {
    backgroundColor: theme.palette.primary.main,
    color: 'white'
  }
}));

export interface RegionItem extends Item<string> {
  flag: () => JSX.Element | null;
  country: string;
}
interface RegionOptionProps extends OptionProps<string> {
  data: RegionItem;
}

type CombinedProps = RegionOptionProps;

export const RegionOption: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { data, label } = props;
  return (
    <Option
      className={classNames({
        [classes.root]: true,
        [classes.focused]: props.isFocused
      })}
      value={data.value}
      attrs={{ ['data-qa-region-select-item']: data.value }}
      {...props}
    >
      <Grid container direction="row" alignItems="center" justify="flex-start">
        <Grid item className="py0">
          {data.flag && data.flag()}
        </Grid>
        <Grid item>{label}</Grid>
      </Grid>
    </Option>
  );
};

export default RegionOption;
