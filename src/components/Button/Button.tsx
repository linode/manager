import * as React from 'react';
import * as classNames from 'classnames';
import { cond, propEq, always } from 'ramda';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button, { ButtonProps } from 'material-ui/Button';
import Reload from 'src/assets/icons/reload.svg';

type ClassNames = 'root'
  | 'loading'
  | 'destructive'
  | 'cancel';

interface Props extends ButtonProps {
  loading?: boolean;
  destructive?: boolean;
  type?: 'primary' | 'secondary' | 'cancel';
  className?: string;
}

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
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
});

type CombinedProps = Props & WithStyles<ClassNames>;

const getVariant = cond([
  [propEq('type', 'primary'), always('raised')],
  [propEq('type', 'secondary'), always('raised')],
  [() => true, always(undefined)],
]);

const getColor = cond([
  [propEq('type', 'primary'), always('primary')],
  [propEq('type', 'secondary'), always('secondary')],
  [() => true, always(undefined)],
]);

// Add invariant warning if loading destructive cancel
// Add invariant warning if destructive cancel

const WrappedButton: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    theme,
    classes,
    loading,
    destructive,
    type,
    className,
    ...rest,
  } = props;

  return React.createElement(
    Button,
    {
      ...rest,
      variant: getVariant(props),
      disabled: props.disabled || loading,
      color: getColor(props),
      className: classNames(
        type,
        {
          [classes.root]: true,
          [classes.loading]: loading,
          [classes.destructive]: destructive,
        },
        className,
      ),
    },
    loading ? <Reload /> : props.children);
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(WrappedButton);
