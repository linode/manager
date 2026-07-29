import { Box, Typography } from '@linode/ui';
import React from 'react';

import LeftArrowIcon from 'src/assets/icons/arrow-left.svg';
import { Link } from 'src/components/Link';

interface PlaygroundLinkProps {
  modelId: string;
}

export const PlaygroundLink = ({ modelId }: PlaygroundLinkProps) => {
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
      <Box alignItems="center" component="span" display="flex" gap={0.2}>
        {/* <Box
          component={Playground}
          height={22}
          mr={0.6}
          style={
            {
              '--color-a':
                cmTheme.palette.mode === 'light'
                  ? 'hsl(210,100%,60%)'
                  : 'hsl(210,100%,65%)',
            } as React.CSSProperties
          }
          width={22}
        /> */}

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
          Playground
        </Typography>

        <LeftArrowIcon
          height={17}
          style={{ transform: 'rotate(180deg)' }}
          width={17}
        />
      </Box>
    </Link>
  );
};
