import * as classNames from 'classnames';
import { always, cond, propEq } from 'ramda';
import * as React from 'react';
import Reload from 'src/assets/icons/reload.svg';
import Button, { ButtonProps } from 'src/components/core/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import HelpIcon from 'src/components/HelpIcon';

export interface Props extends ButtonProps {
  loading?: boolean;
  destructive?: boolean;
  buttonType?: 'primary' | 'secondary';
  className?: string;
  tooltipText?: string;
  compact?: boolean;
  outline?: boolean;
  superCompact?: boolean;
  deleteText?: string;
  loadingText?: string;
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
  root: {
    minWidth: '105px',
    transition: 'none',
  },
  loading: {
    '& svg': {
      margin: '0 auto',
      width: `${theme.spacing(1) + 8}px !important`,
      height: `${theme.spacing(1) + 8}px !important`,
      animation: '$rotate 2s linear infinite',
    },
  },
  compact: {
    paddingLeft: theme.spacing(2) - 2,
    paddingRight: theme.spacing(2) - 2,
    minWidth: '75px',
  },
  superCompact: {
    paddingLeft: 0,
    paddingRight: 0,
    minWidth: '50px',
  },
  outline: {
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 1,
    minHeight: 34,
    '&:hover, &:focus': {
      backgroundColor: `${theme.cmrBGColors.bgSecondaryButton} !important`,
      border: `1px solid ${theme.cmrBorderColors.borderSecondaryButton}`,
      color: theme.cmrTextColors.secondaryButton,
    },
  },
  reg: {
    display: 'flex',
    alignItems: 'center',
  },
}));

type CombinedProps = Props;

const getVariant = cond([
  [propEq('buttonType', 'primary'), always('contained')],
  [propEq('buttonType', 'secondary'), always('contained')],
  [() => true, always(undefined)],
]);

const getColor = cond([
  [propEq('buttonType', 'primary'), always('primary')],
  [propEq('buttonType', 'secondary'), always('secondary')],
  [() => true, always(undefined)],
]);

const WrappedButton: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    loading,
    tooltipText,
    buttonType,
    compact,
    superCompact,
    outline,
    className,
    ...rest
  } = props;

  return (
    <React.Fragment>
      <Button
        {...rest}
        variant={getVariant(props)}
        disabled={props.disabled || loading}
        color={getColor(props)}
        className={classNames(
          buttonType,
          {
            [classes.root]: true,
            [classes.loading]: loading,
            loading,
            [classes.compact]: compact,
            [classes.superCompact]: superCompact,
            [classes.outline]: outline,
            disabled: props.disabled,
          },
          className
        )}
      >
        <span
          className={classNames({
            [classes.reg]: true,
          })}
          data-qa-loading={loading}
        >
          {loading ? <Reload /> : props.children}
        </span>
      </Button>
      {tooltipText && <HelpIcon text={tooltipText} />}
    </React.Fragment>
  );
};

export default WrappedButton;
