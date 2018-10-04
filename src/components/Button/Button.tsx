import * as classNames from 'classnames';
import { always, cond, propEq } from 'ramda';
import * as React from 'react';

import Button, { ButtonProps } from '@material-ui/core/Button';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import HelpIcon from 'src/components/HelpIcon';

import Reload from 'src/assets/icons/reload.svg';

type ClassNames = 'root'
  | 'loading'
  | 'destructive'
  | 'cancel'
  | 'remove'
  | 'compact';

export interface Props extends ButtonProps {
  loading?: boolean;
  destructive?: boolean;
  type?: 'primary' | 'secondary' | 'cancel' | 'remove';
  className?: string;
  tooltipText?: string;
  compact?: boolean;
}

const styles: StyleRulesCallback = (theme) => ({
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  root: {
    '&.cancel': {
      border: `1px solid transparent`,
      transition: theme.transitions.create(['color', 'border-color']),
      '&:hover, &:focus': {
        color: theme.palette.primary.light,
        borderColor: theme.palette.primary.light,
      },
    },
    '&.remove': {
      fontSize: '.9rem',
      border: 0,
      color: '#C44742',
      padding: '14px 26px 14px',
      transition: theme.transitions.create(['color', 'border-color']),
      '&:hover, &:focus': {
        color: '#DF6560',
      },
    },
  },
  loading: {
    '& svg': {
      width: 22,
      height: 22,
      animation: 'rotate 2s linear infinite',
    },
  },
  destructive: {
    borderColor: '#C44742',
    color: '#C44742',
    background: theme.color.white,
    '&.primary': {
      backgroundColor: '#C44742',
      color: theme.color.white,
      '&:hover, &:focus': {
        backgroundColor: '#DF6560',
        color: theme.color.white,
      },
    },
    '&:hover, &:focus': {
      background: theme.color.white,
      color: '#DF6560',
      borderColor: '#DF6560',
    },
    '&:active': {
      color: '#963530',
      borderColor: '#963530',
    },
    '&$loading': {
      color: '#C44742 !important',
      '&.primary': {
        background: 'rgba(0, 0, 0, 0.12) !important',
      },
    },
  },
  compact: {
    paddingLeft: 14,
    paddingRight: 14,
  }
});

type CombinedProps = Props & WithStyles<ClassNames>;

const getVariant = cond([
  [propEq('type', 'primary'), always('raised')],
  [propEq('type', 'secondary'), always('raised')],
  [propEq('type', 'remove'), always('raised')],
  [() => true, always(undefined)],
]);

const getColor = cond([
  [propEq('type', 'primary'), always('primary')],
  [propEq('type', 'secondary'), always('secondary')],
  [propEq('type', 'remove'), always('secondary')],
  [() => true, always(undefined)],
]);

// Add invariant warning if loading destructive cancel
// Add invariant warning if destructive cancel

const wrappedButton: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    theme,
    classes,
    loading,
    destructive,
    tooltipText,
    type,
    compact,
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
          type,
          {
            [classes.root]: true,
            [classes.loading]: loading,
            [classes.destructive]: destructive,
            [classes.compact]: compact,
          },
          className,
        )}
      >
        {loading ? <Reload /> : props.children}
        {type === 'remove' && 'Remove'}
      </Button>
      {tooltipText && <HelpIcon text={tooltipText} />}
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(wrappedButton);
