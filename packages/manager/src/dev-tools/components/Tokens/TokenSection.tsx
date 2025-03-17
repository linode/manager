import { Stack, Typography } from '@linode/ui';
import React from 'react';

import { TokenInfo } from './TokenInfo';

interface TokenSectionProps {
  category: string;
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

  console.log({
    category,
    title,
    value,
    variant,
  });

  const renderValue = (
    <TokenInfo
      category={category}
      color={value}
      value={value}
      variant={variant}
    />
  );

  const renderInfo = isColorValueString
    ? renderValue
    : Object.entries(value).map(([key, value], index) => {
        if (value instanceof Object) {
          return (
            <TokenSection
              category={category}
              key={`${key}-${index}`}
              title={key}
              value={value}
              variant={variant}
            />
          );
        }
        return (
          <TokenInfo
            category={category}
            color={value as string}
            key={`${key}-${index}`}
            value={key}
            variant={variant}
          />
        );
      });

  return (
    <Stack key={variant}>
      <Typography>{title}</Typography>
      <Stack direction="column" flexWrap="wrap" width="100%">
        {renderInfo}
      </Stack>
    </Stack>
  );
};
