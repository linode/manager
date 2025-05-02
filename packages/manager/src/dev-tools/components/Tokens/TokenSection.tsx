import { Stack, Typography } from '@linode/ui';
import React from 'react';

import { TokenInfo } from './TokenInfo';

import type {
  RecursiveTokenObject,
  TokenCategory,
} from '../../DesignTokensTool';

export interface TokenSectionProps {
  category: TokenCategory;
  title: string;
  value: RecursiveTokenObject | string;
  variant: string;
}

export const TokenSection = ({
  category,
  title,
  value,
  variant,
}: TokenSectionProps) => {
  const isColorValueString = typeof value === 'string';

  const renderTokenGroup = (
    groupValue: RecursiveTokenObject | string,
    parentPath: string[] = []
  ) => {
    if (typeof groupValue === 'string') {
      return (
        <TokenInfo
          category={category}
          path={[title, ...parentPath]}
          value={groupValue}
          variant={variant}
        />
      );
    }

    return Object.entries(groupValue).map(([key, value]) => (
      <Stack
        key={key}
        spacing={2}
        sx={{
          mb: 2,
        }}
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
              <Typography
                sx={(theme) => ({
                  font: theme.font.semibold,
                })}
              >
                {key}
              </Typography>
            )}
            {renderTokenGroup(value, [...parentPath, key])}
          </Stack>
        ) : typeof value === 'string' ? (
          <TokenInfo
            category={category}
            path={[title, ...parentPath, key]}
            value={value}
            variant={variant}
          />
        ) : null}
      </Stack>
    ));
  };

  if (isColorValueString) {
    return (
      <Stack sx={{ height: '100%', p: 2 }}>
        <Typography
          sx={(theme) => ({
            backgroundColor: theme.tokens.alias.Background.Normal,
            position: 'sticky',
            top: 0,
            zIndex: 2,
          })}
          variant="h3"
        >
          {title}
        </Typography>
        <TokenInfo
          category={category}
          path={[title]}
          value={value}
          variant={variant}
        />
      </Stack>
    );
  }

  return (
    <Stack sx={{ height: '100%', p: 2 }}>
      <Typography
        sx={(theme) => ({
          backgroundColor: theme.tokens.alias.Background.Normal,
          position: 'sticky',
          top: 0,
          zIndex: 2,
        })}
        variant="h3"
      >
        {title}
      </Typography>
      {renderTokenGroup(value)}
    </Stack>
  );
};
