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

  const renderTokenGroup = (groupValue: any, parentPath: string[] = []) => {
    if (typeof groupValue === 'string') {
      return (
        <TokenInfo
          category={category}
          color={groupValue}
          path={[title, ...parentPath]}
          variant={variant}
        />
      );
    }

    return Object.entries(groupValue).map(([key, value]) => (
      <Stack
        sx={{
          mb: 2,
        }}
        key={key}
        spacing={2}
      >
        {parentPath.length === 0 && (
          <Typography
            sx={(theme) => ({
              borderBottom: `1px solid ${theme.tokens.alias.Border.Normal}`,
              font: theme.font.bold,
              py: 1,
            })}
          >
            {key}
          </Typography>
        )}
        {typeof value === 'object' ? (
          <Stack spacing={1}>
            {parentPath.length > 0 && (
              <Typography variant="h5">{key}</Typography>
            )}
            {renderTokenGroup(value, [...parentPath, key])}
          </Stack>
        ) : typeof value === 'string' ? (
          <TokenInfo
            category={category}
            color={value}
            path={[title, ...parentPath, key]}
            variant={variant}
          />
        ) : null}
      </Stack>
    ));
  };

  if (isColorValueString) {
    return (
      <TokenInfo
        category={category}
        color={value as string}
        path={[title]}
        variant={variant}
      />
    );
  }

  return (
    <Stack sx={{ p: 2 }}>
      <Typography
        sx={{ position: 'sticky', top: 0, backgroundColor: 'white' }}
        variant="h3"
      >
        {title}
      </Typography>
      {renderTokenGroup(value)}
    </Stack>
  );
};
