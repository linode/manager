import classNames from 'classnames';
import * as React from 'react';
import IconButton, { IconButtonProps } from 'src/components/core/IconButton';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';

type ClassNames = 'root' | 'destructive';

interface Props extends IconButtonProps {
  destructive?: boolean;
  style?: any;
  onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
  className?: any;
  disabled?: boolean;
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      transition: theme.transitions.create(['opacity']),
    },
    destructive: {
      color: theme.palette.status.errorDark,
      '&:hover': {
        color: theme.palette.status.errorDark,
        opacity: 0.8,
      },
      '&:focus': {
        color: theme.palette.status.errorDark,
      },
    },
  });

type CombinedProps = Props & WithStyles<ClassNames>;

const IconButtonWrapper: React.FC<CombinedProps> = (props) => {
  const { classes, destructive, style, className, ...rest } = props;

  return (
    <IconButton
      className={classNames(
        {
          [classes.root]: true,
          [classes.destructive]: destructive,
        },
        className
      )}
      style={style}
      {...rest}
    >
      {props.children}
    </IconButton>
  );
};

const styled = withStyles(styles);

export default styled(IconButtonWrapper);
