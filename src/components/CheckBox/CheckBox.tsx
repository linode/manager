import * as classNames from 'classnames';
import * as React from 'react';

import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import CheckboxIcon from 'src/assets/icons/checkbox.svg';
import CheckboxCheckedIcon from 'src/assets/icons/checkboxChecked.svg';

type CSSClasses =
  'root'
  | 'checked'
  | 'disabled'
  | 'warning'
  | 'error';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
  root: {
    color: '#ccc',
    transition: theme.transitions.create(['color']),
    '& .defaultFill': {
      transition: theme.transitions.create(['fill']),
    },
    '&:hover': {
      color: theme.palette.primary.main,
      fill: theme.color.white,
      '& .defaultFill': {
        fill: theme.color.white,
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
    color: theme.palette.status.warningDark,
    '& .defaultFill': {
      fill: theme.palette.status.warning,
    },
    '&$checked': {
      color: theme.palette.status.warningDark,
    },
  },
  error: {
    color: theme.palette.status.errorDark,
    '& .defaultFill': {
      fill: theme.palette.status.error,
    },
    '&$checked': {
      color: theme.palette.status.errorDark,
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
      color="primary"
      className={classnames}
      icon={<CheckboxIcon />}
      checkedIcon={<CheckboxCheckedIcon />}
      data-qa-checked={props.checked}
      { ...rest }
    />
  );
};

export default withStyles(styles, { withTheme: true })(LinodeCheckBox);
