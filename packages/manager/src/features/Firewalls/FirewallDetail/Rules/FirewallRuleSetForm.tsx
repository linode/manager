import { useAllFirewallRuleSetsQuery } from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Box,
  Chip,
  Paper,
  SelectedIcon,
  Stack,
  Typography,
} from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import {
  generateAddressesLabel,
  useIsFirewallRulesetsPrefixlistsEnabled,
} from '../../shared';
import { StyledLabel, StyledListItem, useStyles } from './shared.styles';

import type { FirewallRuleSetFormProps } from './FirewallRuleDrawer.types';

export const FirewallRuleSetForm = React.memo(
  (props: FirewallRuleSetFormProps) => {
    const {
      category,
      errors,
      handleSubmit,
      setFieldTouched,
      setFieldValue,
      touched,
      closeDrawer,
      values,
    } = props;

    const { classes } = useStyles();

    const { isFirewallRulesetsPrefixlistsEnabled } =
      useIsFirewallRulesetsPrefixlistsEnabled();

    const { data, error, isLoading } = useAllFirewallRuleSetsQuery(
      isFirewallRulesetsPrefixlistsEnabled
    );

    const ruleSets = data ?? [];

    // Find the selected ruleset once
    const selectedRuleSet = React.useMemo(
      () => ruleSets.find((r) => r.id === values.ruleset) ?? null,
      [ruleSets, values.ruleset]
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

    const errorText =
      error?.[0].reason ?? (touched.ruleset ? errors.ruleset : undefined);

    return (
      <form onSubmit={handleSubmit}>
        <Box>
          <Typography
            sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}
          >
            RuleSets are reusable collections of Cloud Firewall rules that use
            the same fields as individual rules. They let you manage and update
            multiple rules as a group. You can then apply them across different
            firewalls by reference.
          </Typography>
          <Autocomplete
            disableClearable={ruleSets.length > 0}
            errorText={errorText}
            label="Rule Set"
            loading={isLoading}
            onBlur={() => setFieldTouched('ruleset')}
            onChange={(_, selectedRuleSet) => {
              setFieldValue('ruleset', selectedRuleSet?.value);
            }}
            options={ruleSetDropdownOptions}
            placeholder="Select a Rule Set"
            renderOption={(props, option, { selected }) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Stack direction="column">
                      <b>{option.label}</b>
                      <span>ID: {option.value}</span>
                    </Stack>
                    {selected && <SelectedIcon visible />}
                  </Stack>
                </li>
              );
            }}
            value={
              ruleSetDropdownOptions.find((o) => o.value === values.ruleset) ??
              null
            }
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

        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Add Rule',
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: closeDrawer,
          }}
        />
      </form>
    );
  }
);
