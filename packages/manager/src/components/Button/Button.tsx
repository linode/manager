import classNames from 'classnames';
import { always, cond, propEq } from 'ramda';
import * as React from 'react';
import Reload from 'src/assets/icons/reload.svg';
import _Button, { ButtonProps } from 'src/components/core/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import HelpIcon from 'src/components/HelpIcon';

export interface Props extends ButtonProps {
  buttonType?: 'primary' | 'secondary' | 'outlined';
  className?: string;
  compactX?: boolean;
  compactY?: boolean;
  loading?: boolean;
  tooltipText?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  loading: {
    '& svg': {
      animation: '$rotate 2s linear infinite',
      margin: '0 auto',
      height: `${theme.spacing(2)}px !important`,
      width: `${theme.spacing(2)}px !important`,
    },
  },
  compactX: {
    minWidth: 50,
    paddingRight: 0,
    paddingLeft: 0,
  },
  compactY: {
    minHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  reg: {
    display: 'flex',
    alignItems: 'center',
  },
  '@supports (-moz-appearance: none)': {
    /* Fix text alignment for Firefox */
    reg: {
      marginTop: 2,
    },
  },
  helpIcon: {
    marginLeft: -theme.spacing(),
  },
}));

type CombinedProps = Props;

const getVariant = cond([
  [propEq('buttonType', 'primary'), always('contained')],
  [propEq('buttonType', 'secondary'), always('contained')],
  [propEq('buttonType', 'outlined'), always('outlined')],
  [() => true, always(undefined)],
]);

const getColor = cond([
  [propEq('buttonType', 'primary'), always('primary')],
  [propEq('buttonType', 'secondary'), always('secondary')],
  [() => true, always(undefined)],
]);

export const Button: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    buttonType,
    className,
    compactX,
    compactY,
    loading,
    tooltipText,
    ...rest
  } = props;

  return (
    <React.Fragment>
      <_Button
        {...rest}
        className={classNames(
          buttonType,
          {
            [classes.compactX]: buttonType === 'secondary' ? compactX : false,
            [classes.compactY]: buttonType === 'secondary' ? compactY : false,
            [classes.loading]: loading,
            disabled: props.disabled,
            loading,
          },
          className
        )}
        color={getColor(props)}
        disabled={props.disabled || loading}
        variant={getVariant(props)}
      >
        <span
          className={classNames({
            [classes.reg]: true,
          })}
          data-qa-loading={loading}
        >
          {loading ? <Reload /> : props.children}
        </span>
      </_Button>
      {tooltipText && (
        <HelpIcon className={classes.helpIcon} text={tooltipText} />
      )}
    </React.Fragment>
  );
};

export default Button;
