import { useAllFirewallRuleSetsQuery } from '@linode/queries';
import { Autocomplete, Box, Typography } from '@linode/ui';
import * as React from 'react';

interface AssignRuleSetToFirewallProps {
  errorText?: string;
  handleRuleSetChange: (ruleSetId?: number) => void;
  selectedRuleSetId: number;
}

export const AssignRuleSetToFirewall = React.memo(
  (props: AssignRuleSetToFirewallProps) => {
    const { errorText, handleRuleSetChange, selectedRuleSetId } = props;
    // @TODO - Enable this query only when Firewall RS & PS feature flag is enabled
    const { data, error, isLoading } = useAllFirewallRuleSetsQuery();

    const ruleSets = data ?? [];

    const ruleSetDropdownOptions: { label: string; value: number }[] =
      React.useMemo(() => {
        return ruleSets.map((ruleSet) => ({
          label: ruleSet.label,
          value: ruleSet.id,
        }));
      }, [ruleSets]);

    const selectedOption = React.useMemo(() => {
      return (
        ruleSetDropdownOptions.find(
          (option) => option.value === selectedRuleSetId
        ) ?? null
      );
    }, [ruleSetDropdownOptions, selectedRuleSetId]);

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
      </Box>
    );
  }
);
