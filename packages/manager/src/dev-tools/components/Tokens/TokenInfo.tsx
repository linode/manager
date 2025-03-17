import { Stack } from '@linode/ui';
import React from 'react';

import { ColorSwatch } from './ColorSwatch';
import { TokenCopy } from './TokenCopy';

export const formatValue = (value: any) =>
  isNaN(Number(value)) ? `.${value}` : `[${value}]`;

interface TokenInfoProps {
  category: string;
  color: string;
  value?: string;
  variant: string;
}

export const TokenInfo = ({
  category,
  color,
  value,
  variant,
}: TokenInfoProps) => {
  const jsConcept = category ? `${category}.` : '';
  const cssConcept = category ? `${category}-` : '';

  return (
    <Stack direction="row" flexWrap="nowrap" width="100%">
      <ColorSwatch color={color} />
      <Stack direction="column" flexWrap="wrap" width="100%">
        <TokenCopy format={'Hex'} value={color} />
        <TokenCopy
          format={'JS'}
          value={`tokens.${category}.${variant}.${formatValue(value)}`}
        />
        <TokenCopy
          value={
            category
              ? `--token-${category}-${cssConcept}${category}-${value}`
              : `--token-${category}-color-${category}-${value}`
          }
          format={'CSS'}
          isLowerCase
        />
        <TokenCopy
          value={
            category
              ? `$token-${category}-${cssConcept}${category}-${value}`
              : `$token-${category}-color-${category}-${value}`
          }
          format={'SCSS'}
          isLowerCase
        />
      </Stack>
    </Stack>
  );
};
