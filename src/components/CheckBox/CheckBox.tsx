import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import Checkbox from 'material-ui/Checkbox';
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
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    height: 25,
    width: 25,
    color: '#ccc',
    transition: 'color .2s ease-in-out, background-color .2s ease-in-out',
    borderRadius: 0,
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: '#fff',
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
      backgroundColor: '#3683dc',
    },
    '&$disabled': {
      backgroundColor: '#C9CACB !important',
    },
    '&$warning': {
      backgroundColor: '#ffd322',
      '&:hover': {
        backgroundColor: '#ffd322 !important',
      },
    },
    '&$error': {
      backgroundColor: '#cf1f1f',
      '&:hover': {
        backgroundColor: '#cf1f1f !important',
      },
    },
  },
  warning: {
    color: '#ffd322',
    backgroundColor: '#fef5bf',
  },
  error: {
    backgroundColor: '#f3c8c7',
    color: '#cf1f1f',
  },
  disabled: {
    color: '#ccc !important',
    backgroundColor: '#f4f4f4 !important',
    pointerEvents: 'none',
  },
});

interface Props {
  onClick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: 'warning' | 'error';
  checked: boolean;
  disabled?: boolean;
}

type FinalProps = Props & WithStyles<CSSClasses>;

const LinodeCheckBox: React.StatelessComponent<FinalProps> = (props) => {
  const {
    onClick,
    classes,
    variant,
    checked,
    disabled,
  } = props;

  const classnames = classNames({
    [classes.root]: true,
    [classes.disabled]: disabled === true,
    [classes.checked]: checked === true,
    [classes.warning]: variant === 'warning',
    [classes.error]: variant === 'error',
  });

  return (
    <Checkbox
      className={classnames}
      onChange={onClick}
      checked={checked}
      disabled={disabled}
      icon={<CheckboxIcon />}
      checkedIcon={<CheckboxCheckedIcon />}
    >
    </Checkbox>
  );
};

export default withStyles(styles, { withTheme: true })(LinodeCheckBox);
