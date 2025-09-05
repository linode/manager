import { Box, CircleProgress } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

const StyledLinkButton = styled('button', {
  label: 'StyledLinkButton',
})(({ theme }) => ({
  font: 'inherit',
  ...theme.applyLinkStyles,
}));

interface Props extends React.ComponentProps<typeof StyledLinkButton> {
  isLoading?: boolean;
}

/**
 * A button that looks like a link. (Renders a `<button />` rather than a `<a />`)
 *
 * *Warning:* Do not get this confused with a [Secondary Button](?path=/story/foundations-button--secondary). They are two different components. Also note that our Secondary Button is not the same as the Akamai Core Design System's Secondary Button.
 *
 * *Note:* This component is subject to change and/or removal as Cloud Manager works to conform to the Akamai Design System
 */
export const LinkButton = (props: Props) => {
  const { isLoading, disabled, ...rest } = props;

  const Button = (
    <StyledLinkButton
      disabled={disabled || isLoading}
      tabIndex={0}
      type="button"
      {...rest}
    />
  );

  if (isLoading) {
    return (
      <Box alignItems="center" display="flex" gap={1}>
        {Button}
        <Box>
          <CircleProgress noPadding size="xs" />
        </Box>
      </Box>
    );
  }

  return Button;
};
