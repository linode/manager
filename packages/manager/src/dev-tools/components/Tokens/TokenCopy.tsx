import { Border, Color, Font } from '@linode/design-language-system';
import { Box, Typography } from '@linode/ui';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

interface TokenCopyProps {
  format: 'CSS' | 'JS' | 'SCSS' | 'Val';
  isLowerCase?: boolean;
  value: string;
}

export const TokenValue = ({
  format,
  isLowerCase = false,
  value,
}: TokenCopyProps) => {
  if (isLowerCase) {
    value = value.toLowerCase();
  }

  return (
    <Box
      sx={{
        '.copy-tooltip svg': {
          height: 12,
          top: 1,
          width: 12,
        },
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          mr: 1,
          textAlign: 'right',
          width: 40,
        }}
      >
        <Typography
          sx={{
            color: Color.Neutrals[60],
          }}
        >
          {format}:
        </Typography>
      </Box>{' '}
      <Box
        component="span"
        sx={{
          background: Color.Neutrals[5],
          border: `1px solid ${Border.Normal}`,
          borderRadius: '0.2rem',
          color: Color.Neutrals[90],
          fontFamily: Font.FontFamily.Code,
          fontSize: Font.FontSize.Xxxs,
          px: 0.5,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Box>
      <CopyTooltip copyableText={false} placement="right" text={value} />
    </Box>
  );
};
