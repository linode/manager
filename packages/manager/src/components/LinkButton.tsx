import * as React from 'react';
import classNames from 'classnames';
import Box from './core/Box';
import CircularProgress from './core/CircularProgress';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  disabled: {
    color: theme.palette.text.primary,
    cursor: 'default',
    pointerEvents: 'none',
  },
  link: {
    ...theme.applyLinkStyles,
  },
  spinner: {
    marginLeft: theme.spacing(),
  },
}));

interface Props {
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode | string;
  onClick: () => void;
  style?: React.CSSProperties;
}

export const LinkButton = (props: Props) => {
  const classes = useStyles();
  const {
    children,
    className,
    isDisabled = false,
    isLoading = false,
    onClick,
    style,
  } = props;

  const Button = () => (
    <button
      style={style}
      className={classNames(
        {
          [classes.disabled]: isDisabled,
        },
        className,
        classes.link
      )}
      disabled={isDisabled}
      onClick={onClick}
    >
      {children}
    </button>
  );

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center">
        <Button />
        <CircularProgress size={12} className={classes.spinner} />
      </Box>
    );
  }

  return <Button />;
};
