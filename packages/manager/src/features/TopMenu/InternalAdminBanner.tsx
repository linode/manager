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
      padding={(theme) => theme.tokens.spacing[60]}
      textAlign="center"
    >
      <Typography
        sx={(theme) => ({
          font: theme.tokens.typography.Body.Regular,
        })}
        color={(theme) => theme.tokens.color.Neutrals.Black}
      >
        You are logged in as customer: <strong>{username}</strong>
      </Typography>
    </Box>
  );
};
