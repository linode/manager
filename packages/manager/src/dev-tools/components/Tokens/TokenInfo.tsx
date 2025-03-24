import { Stack } from '@linode/ui';
import React from 'react';

import { ColorSwatch } from './ColorSwatch';
import { TokenValue } from './TokenCopy';
import { camelToKebabCase, formatValue, isGlobalTokenCategory } from './utils';

import type { TokenCategory } from '../../DesignTokensTool';

interface TokenInfoProps {
  category: TokenCategory;
  path: string[];
  value: string;
  variant: string;
}

export const TokenInfo = (props: TokenInfoProps) => {
  const { category, path = [], value, variant } = props;

  const jsPath =
    path.length > 0
      ? path
          .flatMap((segment) => segment.split('.'))
          .map((segment) => formatValue(segment))
          .reduce((result, segment, index) => {
            // First segment never gets a dot
            if (index === 0) {
              return segment;
            }

            // If this segment contains a bracket, don't add a dot
            if (segment.includes('[')) {
              return result + segment;
            }

            // Otherwise add a dot
            return result + '.' + segment;
          }, '')
      : formatValue(variant);
  const cssPath =
    path.length > 0
      ? path
          .flatMap((segment) => segment.split('.'))
          .map((segment) => camelToKebabCase(segment))
          .join('-')
          .toLowerCase()
      : camelToKebabCase(variant);
  const globalCSS = isGlobalTokenCategory(category) ? 'global-' : '';

  return (
    <Stack direction="row" flexWrap="nowrap" minWidth={275}>
      {(value.startsWith('#') || value.startsWith('lch')) && (
        <ColorSwatch color={value} />
      )}
      <Stack direction="column" flexWrap="wrap">
        <TokenValue format={'Val'} value={value} />
        <TokenValue format={'JS'} value={`tokens.${category}.${jsPath}`} />
        <TokenValue
          format={'CSS'}
          isLowerCase
          value={`--token-${globalCSS}${category}-${cssPath}`}
        />
        <TokenValue
          format={'SCSS'}
          isLowerCase
          value={`$token-${globalCSS}${category}-${cssPath}`}
        />
      </Stack>
    </Stack>
  );
};
