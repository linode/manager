import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Switch, { SwitchProps } from '@material-ui/core/Switch';

import ToggleOff from 'src/assets/icons/toggleOff.svg';
import ToggleOn from 'src/assets/icons/toggleOn.svg';

import './toggle.css';




type CSSClasses =
  'root'
  | 'checked'
  | 'disabled';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
  root: {
    marginRight: theme.spacing.unit,
  },
  checked: {},
  disabled: {},
});

type CombinedProps = SwitchProps & WithStyles<CSSClasses>;

const LinodeSwitchControl: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, ...rest } = props;

  const classnames = classNames({
    [classes.root]: true,
    [classes.checked]: Boolean(props.checked),
    [classes.disabled]: props.disabled === true,
  });

  return (
    <Switch
      className={classnames}
      icon={<ToggleOff />}
      checkedIcon={<ToggleOn />}
      {...rest}
    />
  );
};

export default withStyles(styles, { withTheme: true })(LinodeSwitchControl);
