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

type CSSClasses =
  'root'
  | 'checked'
  | 'disabled'
  | 'warning'
  | 'error';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    color: '#ccc',
    transition: 'color .2s ease-in-out, background-color .2s ease-in-out',
    '&:hover': {
      color: theme.palette.primary.main,
      fill: '#fff',
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
    '&:hover': {
      fill: '#3683dc',
    },
    '&$disabled': {
      fill: '#C9CACB !important',
    },
    '&$warning': {
      fill: '#ffd322',
      '&:hover': {
        fill: '#ffd322 !important',
      },
    },
    '&$error': {
      fill: '#cf1f1f',
      '&:hover': {
        fill: '#cf1f1f !important',
      },
    },
  },
  warning: {
    color: '#ffd322',
    fill: '#fef5bf',
    '& .defaultFill': {
      fill: '#fff5bf',
    },
  },
  error: {
    fill: '#f3c8c7',
    color: '#cf1f1f',
    '& .defaultFill': {
      fill: '#f3c7c7',
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
