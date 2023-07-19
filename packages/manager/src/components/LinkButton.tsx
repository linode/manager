import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';

import { Box } from './Box';
import CircularProgress from './core/CircularProgress';

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
  children: React.ReactNode | string;
  className?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
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
      className={classNames(
        {
          [classes.disabled]: isDisabled,
        },
        className,
        classes.link
      )}
      disabled={isDisabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );

  if (isLoading) {
    return (
      <Box alignItems="center" display="flex">
        <Button />
        <CircularProgress className={classes.spinner} size={12} />
      </Box>
    );
  }

  return <Button />;
};
