import { useAllFirewallRuleSetsQuery } from '@linode/queries';
import { Autocomplete, Box, Chip, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { generateAddressesLabel } from '../../shared';

import type { Category } from './shared';

interface AssignRuleSetToFirewallProps {
  category: Category;
  errorText?: string;
  handleRuleSetChange: (ruleSetId?: number) => void;
  selectedRuleSetId: number;
}

export const AssignRuleSetToFirewall = React.memo(
  (props: AssignRuleSetToFirewallProps) => {
    const { category, errorText, handleRuleSetChange, selectedRuleSetId } =
      props;
    // @TODO - Enable this query only when Firewall RS & PS feature flag is enabled
    const { data, error, isLoading } = useAllFirewallRuleSetsQuery();

    const ruleSets = data ?? [];

    // Find the selected ruleset once
    const selectedRuleSet = React.useMemo(
      () => ruleSets.find((r) => r.id === selectedRuleSetId) ?? null,
      [ruleSets, selectedRuleSetId]
    );

    // Build dropdown options
    const ruleSetDropdownOptions = React.useMemo(
      () =>
        ruleSets.map((ruleSet) => ({
          label: ruleSet.label,
          value: ruleSet.id,
        })),
      [ruleSets]
    );

    // The dropdown's selected option can be derived from the selectedRuleSet itself
    const selectedOption = selectedRuleSet
      ? { label: selectedRuleSet.label, value: selectedRuleSet.id }
      : null;

    return (
      <Box>
        <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
          RuleSets are reusable collections of Cloud Firewall rules that use the
          same fields as individual rules. They let you manage and update
          multiple rules as a group. You can then apply them across different
          firewalls by reference.
        </Typography>
        <Autocomplete
          errorText={error?.[0].reason ?? errorText}
          label="Rule Set"
          loading={isLoading}
          onChange={(_, selectedRuleSet) => {
            handleRuleSetChange(selectedRuleSet?.value);
          }}
          options={ruleSetDropdownOptions}
          placeholder="Select Rule Set"
          value={selectedOption}
        />
        {selectedRuleSet && (
          <Box mt={2}>
            <Box pb={1}>Label: {selectedRuleSet?.label}</Box>
            <Box pb={1}>ID: {selectedRuleSet?.id}</Box>
            <Typography pb={1}>{selectedRuleSet?.description}</Typography>
            <Box pb={1}>
              Service Defined: {selectedRuleSet?.is_service_defined}
            </Box>
            <Box pb={1}>Version: {selectedRuleSet?.version}</Box>
            <Box pb={1}>Created: {selectedRuleSet?.created}</Box>
            <Box pb={1}>Updated: {selectedRuleSet?.updated}</Box>
            <Box pb={1}>{capitalize(category)} Rules</Box>
            {selectedRuleSet.rules.map((rule, idx) => (
              <Box key={`firewall-ruleset-rule-${idx}`} pb={0.25}>
                <Chip
                  label={rule.action}
                  sx={(theme) => ({
                    background:
                      rule.action === 'ACCEPT'
                        ? theme.tokens.alias.Background.Positivesubtle
                        : theme.tokens.alias.Background.Negativesubtle,
                    color:
                      rule.action === 'ACCEPT'
                        ? theme.tokens.alias.Content.Text.Positive
                        : theme.tokens.alias.Content.Text.Negative,
                    font: theme.font.bold,
                  })}
                />
                {rule.protocol};&nbsp;{rule.ports};&nbsp;
                {generateAddressesLabel(rule.addresses)}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  }
);
