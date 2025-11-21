import { useFirewallRuleSetQuery } from '@linode/queries';
import { ActionsPanel, Box, Chip, Paper, TooltipIcon } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

import {
  generateAddressesLabelV2,
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
  closeDrawer: () => void;
  ruleset: number;
}

export const FirewallRuleSetDetailsView = (
  props: FirewallRuleSetDetailsViewProps
) => {
  const { category, closeDrawer, ruleset } = props;

  const { isFirewallRulesetsPrefixlistsEnabled } =
    useIsFirewallRulesetsPrefixlistsEnabled();
  const { classes } = useStyles();

  const { data: ruleSetDetails } = useFirewallRuleSetQuery(
    ruleset,
    isFirewallRulesetsPrefixlistsEnabled
  );

  return (
    <Box mt={2}>
      {[
        { label: 'Label', value: ruleSetDetails?.label },
        { label: 'ID', value: ruleSetDetails?.id, copy: true },
        {
          label: 'Description',
          value: ruleSetDetails?.description,
          column: true,
        },
        {
          label: 'Service Defined',
          value: ruleSetDetails?.is_service_defined ? 'Yes' : 'No',
        },
        { label: 'Version', value: ruleSetDetails?.version },
        {
          label: 'Created',
          value: ruleSetDetails?.created && (
            <DateTimeDisplay value={ruleSetDetails.created} />
          ),
        },
        {
          label: 'Updated',
          value: ruleSetDetails?.updated && (
            <DateTimeDisplay value={ruleSetDetails.updated} />
          ),
        },
      ].map((item, idx) => (
        <StyledListItem
          key={`item-${idx}`}
          paddingMultiplier={2}
          sx={
            item.column
              ? { flexDirection: 'column', alignItems: 'flex-start' }
              : {}
          }
        >
          {item.label && (
            <StyledLabel component="span">{item.label}:</StyledLabel>
          )}
          {item.value}
          {item.copy && (
            <CopyTooltip
              className={classes.copyIcon}
              text={String(ruleSetDetails?.id)}
            />
          )}
        </StyledListItem>
      ))}

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
              marginRight: theme.spacingFunction(4),
            })}
            value={ruleSetDetails.deleted}
          />
          <TooltipIcon
            status="info"
            sxTooltipIcon={{
              '& svg': { width: '16px', height: '16px' },
              padding: 0,
              mb: 0.1,
            }}
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
            <Box>
              {rule.protocol};&nbsp;{rule.ports};&nbsp;
              {generateAddressesLabelV2({
                addresses: rule.addresses,
                showTruncateChip: false,
              })}
            </Box>
          </StyledListItem>
        ))}
      </Paper>

      <ActionsPanel
        primaryButtonProps={{
          label: 'Cancel',
          onClick: closeDrawer,
        }}
      />
    </Box>
  );
};
