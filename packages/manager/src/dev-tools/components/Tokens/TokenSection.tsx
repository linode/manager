import { Stack, Typography } from '@linode/ui';
import React from 'react';

import { TokenInfo } from './TokenInfo';

import type { TokenCategory } from '../../DesignTokensTool';

export interface TokenSectionProps {
  category: TokenCategory;
  title: string;
  value: any;
  variant: string;
}

export const TokenSection = ({
  category,
  title,
  value,
  variant,
}: TokenSectionProps) => {
  const isColorValueString = typeof value === 'string';

  const renderValue = (
    <TokenInfo
      category={category}
      color={value}
      path={[variant]}
      variant={variant}
    />
  );

  const renderInfo = isColorValueString
    ? renderValue
    : Object.entries(value).map(([key, nestedValue], index) => {
        if (nestedValue instanceof Object) {
          return (
            <TokenSection
              category={category}
              key={`${key}-${index}`}
              title={key}
              value={nestedValue}
              variant={`${variant}.${key}`}
            />
          );
        }
        return (
          <TokenInfo
            category={category}
            color={nestedValue as string}
            key={`${key}-${index}`}
            path={[variant, key]}
            variant={variant}
          />
        );
      });

  return (
    <Stack key={variant}>
      <Typography variant="h3">{title}</Typography>
      <Stack direction="column" flexWrap="wrap" width="100%">
        {renderInfo}
      </Stack>
    </Stack>
  );
};
