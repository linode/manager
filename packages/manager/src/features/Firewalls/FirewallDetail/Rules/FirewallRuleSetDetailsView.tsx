import { useFirewallRuleSetQuery } from '@linode/queries';
import {
  ActionsPanel,
  Box,
  CircleProgress,
  ErrorState,
  Paper,
  TooltipIcon,
} from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

import {
  generateAddressesLabelV2,
  useIsFirewallRulesetsPrefixlistsEnabled,
} from '../../shared';
import { RULESET_MARKED_FOR_DELETION_TEXT } from './shared';
import {
  StyledChip,
  StyledLabel,
  StyledListItem,
  StyledWarningIcon,
  useStyles,
} from './shared.styles';

import type { Category } from './shared';
import type { FirewallRuleType } from '@linode/api-v4';

interface FirewallRuleSetDetailsViewProps {
  category: Category;
  closeDrawer: () => void;
  ruleset: FirewallRuleType['ruleset'];
}

export const FirewallRuleSetDetailsView = (
  props: FirewallRuleSetDetailsViewProps
) => {
  const { category, closeDrawer, ruleset } = props;

  const { isFirewallRulesetsPrefixlistsEnabled } =
    useIsFirewallRulesetsPrefixlistsEnabled();
  const { classes } = useStyles();

  const {
    data: ruleSetDetails,
    isFetching,
    isError,
    error,
  } = useFirewallRuleSetQuery(
    ruleset ?? -1,
    ruleset !== undefined &&
      ruleset !== null &&
      isFirewallRulesetsPrefixlistsEnabled
  );

  if (isFetching) {
    return (
      <Box display="flex" justifyContent="center" mt={12}>
        <CircleProgress size="md" />
      </Box>
    );
  }

  if (isError) {
    return <ErrorState errorText={error[0].reason} />;
  }

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
            text={RULESET_MARKED_FOR_DELETION_TEXT}
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
            })}
          >
            <StyledChip
              action={rule.action}
              label={capitalize(rule.action?.toLowerCase() ?? '')}
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
