import classNames from 'classnames';
import * as React from 'react';
import IconButton, { IconButtonProps } from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';

interface Props extends IconButtonProps {
  destructive?: boolean;
  style?: any;
  onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
  className?: any;
  disabled?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
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
}));

const IconButtonWrapper = (props: Props) => {
  const { destructive, style, className, ...rest } = props;
  const classes = useStyles();

  return (
    <IconButton
      className={classNames(
        classes.root,
        {
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

export default IconButtonWrapper;
