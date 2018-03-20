import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import CheckBox from 'material-ui-icons/CheckBox';
import CheckBoxOutlineBlank from 'material-ui-icons/CheckBoxOutlineBlank';

type CSSClasses = 'root' | 'warning' | 'error' | 'disabled';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    color: theme.palette.primary.main,
    '&:hover': {
      color: '#4997f4',
    },
  },
  warning: {
    color: '#1f64b6',
  },
  error: {
  },
  disabled: {
    color: '#939598',
    pointerEvents: 'none',
  },
});

interface Props {
  checked: Boolean;
  disabled?: Boolean;
  onClick: () => void;
  variant?: 'warning' | 'error';
}

type FinalProps = Props & WithStyles<CSSClasses>;

const LinodeCheckBox: React.StatelessComponent<FinalProps> = (props) => {
  const {
    classes,
    checked,
    disabled,
    onClick,
    variant,
  } = props;

  const classnames = classNames({
    [classes.root]: true,
    [classes.disabled]: disabled === true,
    [classes.warning]: variant === 'warning',
    [classes.error]: variant === 'error',
  });

  return (
    <React.Fragment>
      {checked
        ? <CheckBox
            className={classnames}
            onClick={onClick}
          />
        : <CheckBoxOutlineBlank
            className={classnames}
            onClick={onClick}
          />
      }
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(LinodeCheckBox);
