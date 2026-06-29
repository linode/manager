import { Box, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import Playground from 'src/assets/icons/ai/playground.svg';
import { Link } from 'src/components/Link';

interface PlaygroundLinkProps {
  modelId: string;
}

export const PlaygroundLink = ({ modelId }: PlaygroundLinkProps) => {
  const cmTheme = useTheme();

  return (
    <Link
      search={{ model: modelId }}
      style={{
        flexShrink: 0,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
      to="/inference-platform/model-playground"
    >
      <Box alignItems="center" component="span" display="flex" gap={0.5}>
        <Box
          component={Playground}
          height={22}
          style={
            {
              '--playground-icon':
                cmTheme.palette.mode === 'light'
                  ? 'hsl(210,100%,60%)'
                  : 'hsl(210,100%,65%)',
            } as React.CSSProperties
          }
          width={22}
        />
        <Typography
          sx={(theme) => ({
            color:
              theme.palette.mode === 'light'
                ? 'hsl(210,100%,40%)'
                : 'hsl(210,100%,60%)',
            font: theme.font.semibold,
            fontSize: 13,
          })}
        >
          Playground →
        </Typography>
      </Box>
    </Link>
  );
};
