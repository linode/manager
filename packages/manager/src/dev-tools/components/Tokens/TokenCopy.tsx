import { Border, Color, Font } from '@linode/design-language-system';
import { Box } from '@linode/ui';
import React from 'react';

import { CopyToClipboardIcon } from './CopyToClipboard';

interface TokenCopyProps {
  format: string;
  isLowerCase?: boolean;
  value: string;
}

export const TokenCopy = ({
  format,
  isLowerCase = false,
  value,
}: TokenCopyProps) => {
  if (isLowerCase) {
    value = value.toLowerCase();
  }

  return (
    <Box>
      <span
        style={{
          display: 'inline-block',
          fontFamily: Font.FontFamily.Code,
          fontSize: Font.FontSize.Xxxs,
          fontWeight: Font.FontWeight.Semibold,
          textAlign: 'right',
          width: 10,
        }}
      >
        {format}:
      </span>{' '}
      <span
        style={{
          background: Color.Neutrals[5],
          border: `1px solid ${Border.Normal}`,
          borderRadius: '0.2rem',
          color: Color.Neutrals[90],
          fontFamily: Font.FontFamily.Code,
          fontSize: Font.FontSize.Xxxs,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
      <CopyToClipboardIcon text={value} />
    </Box>
  );
};
