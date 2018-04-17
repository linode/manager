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
    '&:hover': {
      fill: '#3683dc',
    },
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
      data-qa-radio={props.checked}
    />
  );
};

export default withStyles(styles, { withTheme: true })(LinodeRadioControl);
