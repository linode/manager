import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
  Theme,
} from 'material-ui';
import Radio, { RadioProps } from 'material-ui/Radio';
import RadioIcon from '../../assets/icons/radio.svg';
import RadioIconRadioed from '../../assets/icons/radioRadioed.svg';

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
  },
  error: {
    fill: '#f3c8c7',
    color: '#cf1f1f',
  },
  disabled: {
    color: '#ccc !important',
    fill: '#f4f4f4 !important',
    pointerEvents: 'none',
  },
});

interface Props extends RadioProps {
  variant?: 'warning' | 'error';
}

type FinalProps = Props & WithStyles<CSSClasses>;

const LinodeRadioControl: React.StatelessComponent<FinalProps> = (props) => {
  const { classes, ...rest } = props;

  const classnames = classNames({
    [classes.root]: true,
    [classes.disabled]: props.disabled === true,
    [classes.checked]: props.checked === true,
    [classes.warning]: props.variant === 'warning',
    [classes.error]: props.variant === 'error',
  });

  return (
    <Radio
      className={classnames}
      {...rest}
      icon={<RadioIcon />}
      checkedIcon={<RadioIconRadioed />}
    />
  );
};

export default withStyles(styles, { withTheme: true })(LinodeRadioControl);
