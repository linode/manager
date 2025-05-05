import { Box, CircleProgress, useTheme } from '@linode/ui';
import * as React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const LinkButton = (props: Props) => {
  const theme = useTheme();
  const { isLoading, style, ...rest } = props;

  const Button = (
    <button
      style={{ ...theme.applyLinkStyles, ...style }}
      tabIndex={0}
      type="button"
      {...rest}
    />
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
