import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import Checkbox, { CheckboxProps } from 'material-ui/Checkbox';
import CheckboxIcon from '../../assets/icons/checkbox.svg';
import CheckboxCheckedIcon from '../../assets/icons/checkboxChecked.svg';

import LinodeTheme from '../../../src/theme';

type CSSClasses =
  'root'
  | 'checked'
  | 'disabled'
  | 'warning'
  | 'error';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    color: '#ccc',
    transition: theme.transitions.create(['color']),
    '& .defaultFill': {
      transition: theme.transitions.create(['fill']),
    },
    '&:hover': {
      color: theme.palette.primary.main,
      fill: 'white',
      '& .defaultFill': {
        fill: 'white',
      },
    },
    '&:hover$warning': {
      color: '#ffd322',
    },
    '&:hover$error': {
      color: '#cf1f1f',
    },
  },
  checked: {
    color: theme.palette.primary.main,
  },
  warning: {
    color: LinodeTheme.palette.status.warningDark,
    '& .defaultFill': {
      fill: LinodeTheme.palette.status.warning,
    },
  },
  error: {
    color: LinodeTheme.palette.status.errorDark,
    '& .defaultFill': {
      fill: LinodeTheme.palette.status.error,
    },
  },
  disabled: {
    color: '#ccc !important',
    fill: '#f4f4f4 !important',
    pointerEvents: 'none',
    '& .defaultFill': {
      fill: '#f4f4f4',
    },
  },
});

interface Props extends CheckboxProps {
  variant?: 'warning' | 'error';
}

type FinalProps = Props & WithStyles<CSSClasses>;

const LinodeCheckBox: React.StatelessComponent<FinalProps> = (props) => {
  const { classes, ...rest } = props;

  const classnames = classNames({
    [classes.root]: true,
    [classes.disabled]: props.disabled === true,
    [classes.checked]: Boolean(props.checked),
    [classes.warning]: props.variant === 'warning',
    [classes.error]: props.variant === 'error',
  });

  return (
    <Checkbox
      className={classnames}
      icon={<CheckboxIcon />}
      checkedIcon={<CheckboxCheckedIcon />}
      data-qa-checked={props.checked}
      { ...rest }
    >
    </Checkbox>
  );
};

export default withStyles(styles, { withTheme: true })(LinodeCheckBox);
