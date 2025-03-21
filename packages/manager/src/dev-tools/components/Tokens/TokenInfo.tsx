import { Stack } from '@linode/ui';
import React from 'react';

import { ColorSwatch } from './ColorSwatch';
import { TokenCopy } from './TokenCopy';

import type { TokenCategory } from '../../DesignTokensTool';

export const formatValue = (value: any) =>
  isNaN(Number(value)) ? `${value}` : `[${value}]`;

const camelToKebabCase = (str: string) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

interface TokenInfoProps {
  category: TokenCategory;
  color: string;
  path: string[];
  variant: string;
}

export const TokenInfo = (props: TokenInfoProps) => {
  const { category, color, path = [], variant } = props;

  const jsPath =
    path.length > 0
      ? path
          .flatMap((segment) => segment.split('.'))
          .map((segment) => formatValue(segment))
          .join('.')
      : formatValue(variant);
  const cssPath =
    path.length > 0
      ? path
          .flatMap((segment) => segment.split('.')) // Split any dotted segments
          .map((segment) => camelToKebabCase(segment))
          .join('-')
          .toLowerCase()
      : camelToKebabCase(variant);
  const isGlobalToken =
    category === 'color' || category === 'font' || category === 'spacing';
  const globalCSS = isGlobalToken ? 'global-' : '';

  return (
    <Stack direction="row" flexWrap="nowrap">
      <ColorSwatch color={color} />
      <Stack direction="column" flexWrap="wrap">
        <TokenCopy format={'Hex'} value={color} />
        <TokenCopy format={'JS'} value={`tokens.${category}.${jsPath}`} />
        <TokenCopy
          format={'CSS'}
          isLowerCase
          value={`--token-${globalCSS}${category}-${cssPath}`}
        />
        <TokenCopy
          format={'SCSS'}
          isLowerCase
          value={`$token-${globalCSS}${category}-${cssPath}`}
        />
      </Stack>
    </Stack>
  );
};
