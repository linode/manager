import classNames from 'classnames';
import * as React from 'react';
import { OptionProps } from 'react-select/lib/components/Option';
import Option from 'src/components/EnhancedSelect/components/Option';
import { Item } from 'src/components/EnhancedSelect/Select';

import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

import { distroIcons } from './icons';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1)
  },
  focused: {
    backgroundColor: theme.palette.primary.main,
    color: 'white'
  },
  icon: {
    fontSize: '1.8em'
  }
}));

interface ImageOptionProps extends OptionProps<string> {
  data: Item<string>;
}

type CombinedProps = ImageOptionProps;

export const ImageOption: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { data, label } = props;
  const iconClass = distroIcons[data.label]
    ? `fl-${distroIcons[data.label as string]}`
    : 'fl-tux';

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
        <Grid item>
          <span className={`${iconClass} ${classes.icon}`} />
        </Grid>
        <Grid item>{label}</Grid>
      </Grid>
    </Option>
  );
};

export default ImageOption;
