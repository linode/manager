import { useFirewallRuleSetQuery } from '@linode/queries';
import { Box, Chip, Paper, TooltipIcon } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

import {
  generateAddressesLabel,
  useIsFirewallRulesetsPrefixlistsEnabled,
} from '../../shared';
import {
  StyledLabel,
  StyledListItem,
  StyledWarningIcon,
  useStyles,
} from './shared.styles';

import type { Category } from './shared';

interface FirewallRuleSetDetailsViewProps {
  category: Category;
  ruleset: number;
}

export const FirewallRuleSetDetailsView = (
  props: FirewallRuleSetDetailsViewProps
) => {
  const { category, ruleset } = props;

  const { isFirewallRulesetsPrefixlistsEnabled } =
    useIsFirewallRulesetsPrefixlistsEnabled();
  const { classes } = useStyles();

  const { data: ruleSetDetails } = useFirewallRuleSetQuery(
    ruleset,
    isFirewallRulesetsPrefixlistsEnabled
  );

  return (
    <Box mt={2}>
      <StyledListItem paddingMultiplier={2}>
        <StyledLabel component="span">Label: </StyledLabel>
        {ruleSetDetails?.label}
      </StyledListItem>
      <StyledListItem paddingMultiplier={2}>
        <StyledLabel component="span">ID: </StyledLabel>
        {ruleSetDetails?.id}
        <CopyTooltip
          className={classes.copyIcon}
          text={String(ruleSetDetails?.id)}
        />
      </StyledListItem>
      <StyledListItem
        paddingMultiplier={2}
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <StyledLabel component="span">Description</StyledLabel>
        {ruleSetDetails?.description}
      </StyledListItem>
      <StyledListItem paddingMultiplier={2}>
        <StyledLabel component="span">Service Defined: </StyledLabel>
        {ruleSetDetails?.is_service_defined ? 'Yes' : 'No'}
      </StyledListItem>
      <StyledListItem paddingMultiplier={2}>
        <StyledLabel component="span">Version: </StyledLabel>
        {ruleSetDetails?.version}
      </StyledListItem>
      <StyledListItem paddingMultiplier={2}>
        <StyledLabel component="span">Created: </StyledLabel>
        {ruleSetDetails?.created && (
          <DateTimeDisplay value={ruleSetDetails.created} />
        )}
      </StyledListItem>
      <StyledListItem paddingMultiplier={2}>
        <StyledLabel component="span">Updated: </StyledLabel>
        {ruleSetDetails?.updated && (
          <DateTimeDisplay value={ruleSetDetails.updated} />
        )}
      </StyledListItem>

      {ruleSetDetails?.deleted && (
        <StyledListItem paddingMultiplier={2}>
          <StyledWarningIcon />
          <StyledLabel
            component="span"
            sx={(theme) => ({
              color: theme.tokens.alias.Content.Text.Negative,
            })}
          >
            Marked for deletion:
          </StyledLabel>
          <DateTimeDisplay
            sx={(theme) => ({
              color: theme.tokens.alias.Content.Text.Negative,
            })}
            value={ruleSetDetails.deleted}
          />
          <TooltipIcon
            status="info"
            text="This rule set will be automatically deleted when it’s no longer referenced by other firewalls."
          />
        </StyledListItem>
      )}

      <Paper
        sx={(theme) => ({
          backgroundColor: theme.tokens.alias.Background.Neutral,
          padding: theme.spacingFunction(12),
          marginTop: theme.spacingFunction(8),
        })}
      >
        <StyledLabel
          sx={(theme) => ({ marginBottom: theme.spacingFunction(4) })}
        >
          {capitalize(category)} Rules
        </StyledLabel>
        {ruleSetDetails?.rules.map((rule, idx) => (
          <StyledListItem
            component="span"
            key={`firewall-ruleset-rule-${idx}`}
            sx={(theme) => ({
              padding: `${theme.spacingFunction(4)} 0`,
              alignItems: 'flex-start',
            })}
          >
            <Chip
              label={capitalize(rule.action?.toLowerCase() ?? '')}
              sx={(theme) => ({
                background:
                  rule.action === 'ACCEPT'
                    ? theme.tokens.component.Badge.Positive.Subtle.Background
                    : theme.tokens.component.Badge.Negative.Subtle.Background,
                color:
                  rule.action === 'ACCEPT'
                    ? theme.tokens.component.Badge.Positive.Subtle.Text
                    : theme.tokens.component.Badge.Negative.Subtle.Text,
                font: theme.font.bold,
                width: '51px',
                fontSize: theme.tokens.font.FontSize.Xxxs,
                marginRight: theme.spacingFunction(6),
                flexShrink: 0,
              })}
            />
            {rule.protocol};&nbsp;{rule.ports};&nbsp;
            {generateAddressesLabel(rule.addresses)}
          </StyledListItem>
        ))}
      </Paper>
    </Box>
  );
};
