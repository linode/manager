import { Box, CircleProgress, StyledLinkButton } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  disabled: {
    color: theme.palette.text.primary,
    cursor: 'default',
    pointerEvents: 'none',
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
      tabIndex={0}
      type="button"
    >
      {children}
    </StyledLinkButton>
  );

  if (isLoading) {
    return (
      <Box alignItems="center" display="flex">
        {Button}
        <Box marginLeft={1}>
          <CircleProgress noPadding size="xs" />
        </Box>
      </Box>
    );
  }

  return Button;
};
