import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { Box } from './Box';
import { StyledLinkButton } from './Button/StyledLinkButton';
import { CircularProgress } from './CircularProgress';

const useStyles = makeStyles()((theme: Theme) => ({
  disabled: {
    color: theme.palette.text.primary,
    cursor: 'default',
    pointerEvents: 'none',
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
  const { classes, cx } = useStyles();
  const {
    children,
    className,
    isDisabled = false,
    isLoading = false,
    onClick,
    style,
  } = props;

  const Button = (
    <StyledLinkButton
      className={cx(
        {
          [classes.disabled]: isDisabled,
        },
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      style={style}
      type="button"
    >
      {children}
    </StyledLinkButton>
  );

  if (isLoading) {
    return (
      <Box alignItems="center" display="flex">
        {Button}
        <CircularProgress className={classes.spinner} size={12} />
      </Box>
    );
  }

  return Button;
};
