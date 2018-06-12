import * as React from 'react';
import * as classNames from 'classnames';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import IconButton, { IconButtonProps } from 'material-ui/IconButton';

type ClassNames = 'root' | 'destructive';

interface Props {
  destructive?: boolean;
  onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
}

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    transition: theme.transitions.create(['opacity']),
  },
  destructive: {
    color: theme.palette.status.errorDark,
    '&:hover': {
      color: theme.palette.status.errorDark,
      opacity: .8,
    },
    '&:focus': {
      color: theme.palette.status.errorDark,
    },
  },
});

type CombinedProps = IconButtonProps & Props & WithStyles<ClassNames>;

const IconButtonWrapper: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, destructive, ...rest } = props;

  return (
    <IconButton
      className={classNames({
        [classes.root]: true,
        [classes.destructive]: destructive,
      })}
      {...rest}
    >
      {props.children}
    </IconButton>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(IconButtonWrapper);
