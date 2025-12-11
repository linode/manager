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
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

import {
  generateAddressesLabelV2,
  useIsFirewallRulesetsPrefixlistsEnabled,
} from '../../shared';
import { StyledLabel, StyledListItem, useStyles } from './shared.styles';

import type { FirewallRuleSetFormProps } from './FirewallRuleDrawer.types';
import type { Category } from './shared';
import type { FirewallRuleSet, FirewallRuleType } from '@linode/api-v4';

interface FilterRuleSetsArgs {
  category: Category;
  inboundAndOutboundRules: FirewallRuleType[];
  ruleSets: FirewallRuleSet[];
}

/**
 * Display only those Rule Sets that:
 * - are applicable to the given category
 * - are not already referenced by the firewall
 * - are not marked for deletion
 */
export const filterRuleSets = ({
  ruleSets,
  category,
  inboundAndOutboundRules,
}: FilterRuleSetsArgs) => {
  return ruleSets.filter((ruleSet) => {
    // TODO: Firewall RuleSets: Remove this client-side filter once the API supports filtering by the 'type' field
    const isCorrectType = ruleSet.type === category;

    const isNotAlreadyReferenced = !inboundAndOutboundRules.some(
      (rule) => rule.ruleset === ruleSet.id
    );

    const isNotMarkedForDeletion = ruleSet.deleted === null;

    return isCorrectType && isNotAlreadyReferenced && isNotMarkedForDeletion;
  });
};

export const FirewallRuleSetForm = React.memo(
  (props: FirewallRuleSetFormProps) => {
    const {
      category,
      closeDrawer,
      errors,
      handleOpenPrefixListDrawer,
      handleSubmit,
      inboundAndOutboundRules,
      setFieldTouched,
      setFieldValue,
      touched,
      values,
    } = props;

    const { classes } = useStyles();

    const { isFirewallRulesetsPrefixlistsFeatureEnabled } =
      useIsFirewallRulesetsPrefixlistsEnabled();

    const { data, error, isLoading } = useAllFirewallRuleSetsQuery(
      isFirewallRulesetsPrefixlistsFeatureEnabled
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
        filterRuleSets({
          ruleSets,
          category,
          inboundAndOutboundRules,
        }).map((ruleSet) => ({
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
            Rule Sets are reusable collections of Cloud Firewall rules that use
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
            placeholder="Type to search or select a Rule Set"
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
                      <Box
                        sx={(theme) => ({
                          // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
                          fontWeight: theme.tokens.font.FontWeight.Semibold,
                        })}
                      >
                        {option.label}
                      </Box>
                      <Box
                        sx={(theme) => ({
                          color:
                            theme.tokens.component.Dropdown.Text.Description,
                        })}
                      >
                        ID: {option.value}
                      </Box>
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
              {[
                { label: 'Label', value: selectedRuleSet.label },
                { label: 'ID', value: selectedRuleSet.id, copy: true },
                { label: null, value: selectedRuleSet.description },
                {
                  label: 'Service Defined',
                  value: selectedRuleSet.is_service_defined ? 'Yes' : 'No',
                },
                { label: 'Version', value: selectedRuleSet.version },
                {
                  label: 'Created',
                  value: selectedRuleSet.created && (
                    <DateTimeDisplay value={selectedRuleSet.created} />
                  ),
                },
                {
                  label: 'Updated',
                  value: selectedRuleSet.updated && (
                    <DateTimeDisplay value={selectedRuleSet.updated} />
                  ),
                },
              ].map((item, idx) => (
                <StyledListItem key={`item-${idx}`}>
                  {item.label && (
                    <StyledLabel component="span">{item.label}: </StyledLabel>
                  )}
                  {item.value}

                  {item.copy && (
                    <CopyTooltip
                      className={classes.copyIcon}
                      text={String(selectedRuleSet.id)}
                    />
                  )}
                </StyledListItem>
              ))}

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
                      label={capitalize(rule.action?.toLowerCase() ?? '')}
                      sx={(theme) => ({
                        background:
                          rule.action === 'ACCEPT'
                            ? theme.tokens.component.Badge.Positive.Subtle
                                .Background
                            : theme.tokens.component.Badge.Negative.Subtle
                                .Background,
                        color:
                          rule.action === 'ACCEPT'
                            ? theme.tokens.component.Badge.Positive.Subtle.Text
                            : theme.tokens.component.Badge.Negative.Subtle.Text,
                        font: theme.font.bold,
                        width: '51px',
                        fontSize: theme.tokens.font.FontSize.Xxxs,
                        marginRight: theme.spacingFunction(6),
                        flexShrink: 0,
                        alignSelf: 'flex-start',
                      })}
                    />
                    <Box>
                      {rule.protocol};&nbsp;{rule.ports};&nbsp;
                      {generateAddressesLabelV2({
                        addresses: rule.addresses,
                        onPrefixListClick: handleOpenPrefixListDrawer,
                        showTruncateChip: false,
                      })}
                    </Box>
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
