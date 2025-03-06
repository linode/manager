import { Box, Typography } from '@linode/ui';
import React from 'react';

interface InternalAdminBannerProps {
  username: string;
}

export const InternalAdminBanner = (props: InternalAdminBannerProps) => {
  const { username } = props;

  return (
    <Box
      bgcolor={(theme) => theme.tokens.color.Pink[40]}
      padding={(theme) => theme.tokens.spacing.S16}
      textAlign="center"
    >
      <Typography
        sx={(theme) => ({
          color: theme.tokens.color.Neutrals.Black,
          font: theme.tokens.typography.Body.Regular,
        })}
      >
        You are logged in as customer: <strong>{username}</strong>
      </Typography>
    </Box>
  );
};
