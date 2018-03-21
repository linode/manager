import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import Check from 'material-ui-icons/Check';

type CSSClasses =
'root'
| 'checked'
| 'disabled'
| 'warning'
| 'error'
;

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    display: 'inline-block',
    cursor: 'pointer',
    boxSizing: 'border-box',
    height: '26px',
    width: '26px',
    border: '1px solid #C9CACB;',
    backgroundColor: '#fff',
    color: '#fff',
    '&:hover': {
      borderColor: '#3683dc',
    },
    '&:hover$warning': {
      borderColor: '#ffd322',
      backgroundColor: '#fff',
    },
    '&:hover$error': {
      borderColor: '#cf1f1f',
      backgroundColor: '#fff',
    },
  },
  checked: {
    borderColor: '#3683dc',
    backgroundColor: '#3683dc',
    '&:hover': {
      backgroundColor: '#3683dc',
    },
    '&$disabled': {
      backgroundColor: '#C9CACB !important',
    },
    '&$warning': {
      borderColor: '#ffd322',
      backgroundColor: '#ffd322',
      '&:hover': {
        backgroundColor: '#ffd322 !important',
      },
    },
    '&$error': {
      borderColor: '#cf1f1f',
      backgroundColor: '#cf1f1f',
      '&:hover': {
        backgroundColor: '#cf1f1f !important',
      },
    },
  },
  disabled: {
    backgroundColor: '#f4f4f4 !important',
    borderColor: '#C9CACB !important',
    pointerEvents: 'none',
  },
  warning: {
    borderColor: '#ffd322',
    backgroundColor: '#fef5bf',
  },
  error: {
    borderColor: '#cf1f1f',
    backgroundColor: '#f3c8c7',
  },
});

interface Props {
  onClick: () => void;
  variant?: 'warning' | 'error';
  checked: Boolean;
  disabled?: Boolean;
}

type FinalProps = Props & WithStyles<CSSClasses>;

const LinodeCheckBox: React.StatelessComponent<FinalProps> = (props) => {
  const {
    classes,
    onClick,
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
    <div
      className={classnames}
      onClick={onClick}
    >
      {checked && <Check />}
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(LinodeCheckBox);
