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
| 'defaultChecked'
| 'warning'
| 'warningChecked'
| 'error'
| 'errorChecked'
| 'disabled'
| 'disabledChecked';

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
  disabled: {
    backgroundColor: '#f4f4f4',
    pointerEvents: 'none',
  },
  disabledChecked: {
    backgroundColor: '#C9CACB',
  },
  defaultChecked: {
    borderColor: '#3683dc',
    backgroundColor: '#3683dc',
    '&:hover': {
      backgroundColor: '#3683dc',
    },
  },
  warning: {
    borderColor: '#ffd322',
    backgroundColor: '#fef5bf',
  },
  warningChecked: {
    borderColor: '#ffd322',
    backgroundColor: '#ffd322',
    '&:hover': {
      backgroundColor: '#ffd322 !important',
    },
  },
  error: {
    borderColor: '#cf1f1f',
    backgroundColor: '#f3c8c7',
  },
  errorChecked: {
    borderColor: '#cf1f1f',
    backgroundColor: '#cf1f1f',
    '&:hover': {
      backgroundColor: '#cf1f1f !important',
    },
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
    [classes.disabled]:
      disabled === true,
    [classes.disabledChecked]:
      checked === true
      && disabled === true,
    [classes.defaultChecked]:
      checked === true
      && disabled !== true
      && !(variant === 'warning' || variant === 'error'),
    [classes.warning]:
      disabled !== true
      && variant === 'warning',
    [classes.warningChecked]:
      checked === true
      && disabled !== true
      && variant === 'warning',
    [classes.error]:
      disabled !== true
      && variant === 'error',
    [classes.errorChecked]:
      checked === true
      && disabled !== true
      && variant === 'error',
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
