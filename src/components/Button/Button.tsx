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

type ClassNames = 'loading' | 'destructive';

interface Props extends ButtonProps {
  loading?: boolean;
  destructive?: boolean;
  type?: 'primary' | 'secondary' | 'cancel';
}

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  loading: {
    '& svg': {
      width: 22,
      height: 22,
      animation: 'rotate 2s linear infinite',
    },
    destructive: {},
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

const WrappedButton: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    theme,
    classes,
    loading,
    destructive,
    type,
    ...rest,
  } = props;

  return React.createElement(
    Button,
    {
      variant: getVariant(props),
      color: getColor(props),
      className: classNames({
        [classes.loading]: loading,
        [classes.destructive]: destructive,
      }),
      ...rest,
    },
    loading ? <Reload /> : props.children);
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(WrappedButton);
