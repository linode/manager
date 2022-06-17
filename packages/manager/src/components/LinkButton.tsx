import * as React from 'react';
import classNames from 'classnames';
import Box from './core/Box';
import CircularProgress from './core/CircularProgress';
import { makeStyles, Theme } from './core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    ...theme.applyLinkStyles,
  },
  disabled: {
    color: theme.palette.text.primary,
    pointerEvents: 'none',
    cursor: 'default',
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
}

export const LinkButton = (props: Props) => {
  const classes = useStyles();
  const {
    isLoading = false,
    isDisabled = false,
    onClick,
    className,
    children,
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
