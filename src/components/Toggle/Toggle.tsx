import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import Switch, { SwitchProps } from 'material-ui/Switch';

import ToggleOff from 'src/assets/icons/toggleOff.svg';
import ToggleOn from 'src/assets/icons/toggleOn.svg';

type CSSClasses =
  'root'
  | 'rightLabel'
  | 'topLabel'
  | 'checked'
  | 'disabled';

interface Props extends SwitchProps {
  labelTop?: boolean;
  label: string;
}

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {},
  checked: {},
  disabled: {},
  rightLabel: {
    '& > span:last-child': {
      marginLeft: theme.spacing.unit,
    },
  },
  topLabel: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
    margin: '0 0 0 -12px',
    '& > span:last-child': {
      position: 'relative',
      left: 12,
      top: 5,
      fontSize: '.9rem',
    },
  },
});

type CombinedProps = Props & WithStyles<CSSClasses>;

const LinodeSwitchControl: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, label, labelTop, ...rest } = props;

  const labelClasses = classNames({
    [classes.topLabel]: props.labelTop,
    [classes.rightLabel]: !props.labelTop,
  });

  const classnames = classNames({
    [classes.root]: true,
    [classes.checked]: Boolean(props.checked),
    [classes.disabled]: props.disabled === true,
  });

  return (
    <FormControlLabel
      className={labelClasses}
      control={
        <Switch
          className={classnames}
          icon={<ToggleOff />}
          checkedIcon={<ToggleOn />}
          {...rest}
        >
        </Switch>
    }
    label={label}
    />
  );
};

export default withStyles(styles, { withTheme: true })(LinodeSwitchControl);
