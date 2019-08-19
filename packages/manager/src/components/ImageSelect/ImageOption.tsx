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

interface ImageOptionProps extends OptionProps<string> {
  data: Item<string>;
}

type CombinedProps = ImageOptionProps;

const distroIcons = {
  Alpine: 'alpine',
  Arch: 'archlinux',
  CentOS: 'centos',
  CoreOS: 'coreos',
  Debian: 'debian',
  Fedora: 'fedora',
  Gentoo: 'gentoo',
  openSUSE: 'opensuse',
  Slackware: 'slackware',
  Ubuntu: 'ubuntu'
};

export const ImageOption: React.FC<CombinedProps> = props => {
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
        <Grid item>
          <span className={`fl-${distroIcons[data.label as string]}`} />
        </Grid>
        <Grid item>{label}</Grid>
      </Grid>
    </Option>
  );
};

export default ImageOption;
