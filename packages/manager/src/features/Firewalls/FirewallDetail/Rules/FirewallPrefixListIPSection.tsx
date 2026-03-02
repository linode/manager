import { Chip, Paper } from '@linode/ui';
import React from 'react';

import { StyledLabel, StyledListItem } from './shared.styles';

interface PrefixListIPSectionProps {
  addresses: string[];
  inUse: boolean;
  type: 'IPv4' | 'IPv6';
}

/**
 * Displays a Prefix List IP section (IPv4 or IPv6) with usage indicator.
 */
export const PrefixListIPSection = ({
  type,
  inUse,
  addresses,
}: PrefixListIPSectionProps) => {
  return (
    <Paper
      data-testid={`${type.toLowerCase()}-section`}
      sx={(theme) => ({
        backgroundColor: theme.tokens.alias.Background.Neutral,
        padding: theme.spacingFunction(12),
        ...(inUse && {
          border: `1px solid ${theme.tokens.alias.Border.Positive}`,
        }),
      })}
    >
      <StyledLabel
        sx={(theme) => ({
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: theme.spacingFunction(4),
          ...(!inUse && {
            color: theme.tokens.alias.Content.Text.Primary.Disabled,
          }),
        })}
      >
        {type}
        <Chip
          data-testid={`${type.toLowerCase()}-chip`}
          label={inUse ? 'in use' : 'not in use'}
          sx={(theme) => ({
            background: inUse
              ? theme.tokens.component.Badge.Positive.Subtle.Background
              : theme.tokens.component.Badge.Neutral.Subtle.Background,
            color: inUse
              ? theme.tokens.component.Badge.Positive.Subtle.Text
              : theme.tokens.component.Badge.Neutral.Subtle.Text,
            font: theme.font.bold,
            fontSize: theme.tokens.font.FontSize.Xxxs,
            marginRight: theme.spacingFunction(6),
            flexShrink: 0,
          })}
        />
      </StyledLabel>

      <StyledListItem
        component="span"
        sx={(theme) => ({
          ...(!inUse && {
            color: theme.tokens.alias.Content.Text.Primary.Disabled,
          }),
        })}
      >
        {addresses.length > 0 ? addresses.join(', ') : <i>no IP addresses</i>}
      </StyledListItem>
    </Paper>
  );
};
