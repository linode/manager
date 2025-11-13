import { useAllFirewallRuleSetsQuery } from '@linode/queries';
import { Autocomplete, Box, Chip, Paper, styled, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import {
  generateAddressesLabel,
  useIsFirewallRulesetsPrefixlistsEnabled,
} from '../../shared';

import type { Category } from './shared';
import type { Theme } from '@linode/ui';

interface AssignRuleSetToFirewallProps {
  category: Category;
  errorText?: string;
  handleRuleSetChange: (ruleSetId?: number) => void;
  selectedRuleSetId?: null | number;
}

const StyledListItem = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    padding: `${theme.spacingFunction(4)} 0`,
  })
);

export const StyledLabel = styled(Box, {
  label: 'StyledLabelBox',
})(({ theme }) => ({
  font: theme.font.bold,
  marginRight: theme.spacingFunction(4),
}));

const useStyles = makeStyles()((theme: Theme) => ({
  copyIcon: {
    '& svg': {
      height: '1em',
      width: '1em',
    },
    color: theme.palette.primary.main,
    display: 'inline-block',
    position: 'relative',
    marginTop: theme.spacingFunction(2),
  },
}));

export const AssignRuleSetSection = React.memo(
  (props: AssignRuleSetToFirewallProps) => {
    const { category, errorText, handleRuleSetChange, selectedRuleSetId } =
      props;

    const { classes } = useStyles();

    const { isFirewallRulesetsPrefixlistsEnabled } =
      useIsFirewallRulesetsPrefixlistsEnabled();

    const { data, error, isLoading } = useAllFirewallRuleSetsQuery(
      isFirewallRulesetsPrefixlistsEnabled
    );

    const ruleSets = data ?? [];

    // Auto-select the first rule set if none selected yet
    React.useEffect(() => {
      if (
        ruleSets.length > 0 &&
        (selectedRuleSetId === null || selectedRuleSetId === undefined)
      ) {
        handleRuleSetChange(ruleSets[0].id);
      }
    }, [ruleSets, selectedRuleSetId, handleRuleSetChange]);

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
          disableClearable={ruleSets.length > 0}
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
            <StyledListItem>
              <StyledLabel component="span">Label: </StyledLabel>
              {selectedRuleSet?.label}
            </StyledListItem>
            <StyledListItem>
              <StyledLabel component="span">ID: </StyledLabel>
              {selectedRuleSet?.id}
              <CopyTooltip
                className={classes.copyIcon}
                text={String(selectedRuleSet?.id)}
              />
            </StyledListItem>
            <StyledListItem>{selectedRuleSet?.description}</StyledListItem>
            <StyledListItem>
              <StyledLabel component="span">Service Defined: </StyledLabel>
              {selectedRuleSet?.is_service_defined ? 'Yes' : 'No'}
            </StyledListItem>
            <StyledListItem>
              <StyledLabel component="span">Version: </StyledLabel>
              {selectedRuleSet?.version}
            </StyledListItem>
            <StyledListItem>
              <StyledLabel component="span">Created: </StyledLabel>
              {selectedRuleSet?.created}
            </StyledListItem>
            <StyledListItem>
              <StyledLabel component="span">Updated: </StyledLabel>
              {selectedRuleSet?.updated}
            </StyledListItem>

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
              {selectedRuleSet.rules.map((rule, idx) => (
                <StyledListItem
                  component="span"
                  key={`firewall-ruleset-rule-${idx}`}
                  sx={(theme) => ({
                    padding: `${theme.spacingFunction(4)} 0`,
                  })}
                >
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
                      width: '58px',
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
        )}
      </Box>
    );
  }
);
