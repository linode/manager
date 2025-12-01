import { useAllFirewallPrefixListsQuery } from '@linode/queries';
import { Box, Button, Chip, Drawer, Paper, TooltipIcon } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import ArrowLeftIcon from 'src/assets/icons/arrow-left.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

import { useIsFirewallRulesetsPrefixlistsEnabled } from '../../shared';
import {
  getPrefixListType,
  PREFIXLIST_MARKED_FOR_DELETION_TEXT,
} from './shared';
import {
  StyledLabel,
  StyledListItem,
  StyledWarningIcon,
  useStyles,
} from './shared.styles';

import type { PrefixListRuleReference } from '../../shared';
import type { FirewallRuleDrawerMode } from './FirewallRuleDrawer.types';
import type { Category } from './shared';

export interface PrefixListDrawerReference {
  modeViewedFrom?: FirewallRuleDrawerMode; // Optional in the case of normal rules
  plRuleRef: PrefixListRuleReference;
  type: 'rule' | 'ruleset';
}

export interface FirewallPrefixListDrawerProps {
  category: Category;
  isOpen: boolean;
  onClose: (options?: { closeAll: boolean }) => void;
  reference: PrefixListDrawerReference | undefined;
  selectedPrefixListLabel: string | undefined;
}

export const FirewallPrefixListDrawer = React.memo(
  (props: FirewallPrefixListDrawerProps) => {
    const { category, onClose, reference, isOpen, selectedPrefixListLabel } =
      props;

    const { isFirewallRulesetsPrefixlistsFeatureEnabled } =
      useIsFirewallRulesetsPrefixlistsEnabled();
    const { classes } = useStyles();

    const { data, error, isFetching } = useAllFirewallPrefixListsQuery(
      isFirewallRulesetsPrefixlistsFeatureEnabled,
      {},
      { name: selectedPrefixListLabel }
    );

    const prefixListDetails = data?.[0];

    const isIPv4Supported =
      prefixListDetails?.ipv4 !== null && prefixListDetails?.ipv4 !== undefined;
    const isIPv6Supported =
      prefixListDetails?.ipv6 !== null && prefixListDetails?.ipv6 !== undefined;

    const isIPv4InUse = reference?.plRuleRef.inIPv4Rule;
    const isIPv6InUse = reference?.plRuleRef.inIPv6Rule;

    const titleText =
      reference?.type === 'ruleset' && reference.modeViewedFrom === 'create'
        ? `Add an ${capitalize(category)} Rule or Rule Set`
        : reference?.type === 'ruleset' && reference.modeViewedFrom === 'view'
          ? `${capitalize(category)} Rule Set details`
          : reference?.type === 'rule' && reference.modeViewedFrom === 'edit'
            ? 'Edit Rule'
            : 'Prefix List details';

    const backButtonText =
      reference?.type === 'ruleset' && reference.modeViewedFrom === 'create'
        ? `Back to ${capitalize(category)} Rule Set`
        : reference?.type === 'ruleset' && reference.modeViewedFrom === 'view'
          ? 'Back to the Rule Set'
          : reference?.type === 'rule' && reference.modeViewedFrom === 'edit'
            ? 'Back to Rule'
            : null;

    const plFieldLabel =
      reference?.type === 'rule' && reference.modeViewedFrom === undefined
        ? 'Name'
        : 'Prefix List Name';

    return (
      <Drawer
        error={error}
        isFetching={isFetching}
        onClose={() => onClose({ closeAll: true })}
        open={isOpen}
        title={titleText}
      >
        <Box mt={2}>
          {prefixListDetails && (
            <>
              {[
                {
                  label: plFieldLabel,
                  value: prefixListDetails.name,
                },
                {
                  label: 'ID',
                  value: prefixListDetails.id,
                  copy: true,
                },
                {
                  label: 'Description',
                  value: prefixListDetails.description,
                  column: true,
                },
                {
                  label: 'Type',
                  value: getPrefixListType(prefixListDetails.name),
                },
                {
                  label: 'Visibility',
                  value: capitalize(prefixListDetails.visibility),
                },
                {
                  label: 'Version',
                  value: prefixListDetails.version,
                },
                {
                  label: 'Created',
                  value: <DateTimeDisplay value={prefixListDetails.created} />,
                },
                {
                  label: 'Updated',
                  value: <DateTimeDisplay value={prefixListDetails.updated} />,
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
                    <StyledLabel component="span">{item.label}: </StyledLabel>
                  )}

                  {item.value}

                  {item.copy && (
                    <CopyTooltip
                      className={classes.copyIcon}
                      text={String(item.value)}
                    />
                  )}
                </StyledListItem>
              ))}

              {prefixListDetails.deleted && (
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
                    value={prefixListDetails.deleted}
                  />
                  <TooltipIcon
                    status="info"
                    sxTooltipIcon={{
                      '& svg': { width: '16px', height: '16px' },
                      padding: 0,
                      mb: 0.1,
                    }}
                    text={PREFIXLIST_MARKED_FOR_DELETION_TEXT}
                  />
                </StyledListItem>
              )}

              {isIPv4Supported && (
                <Paper
                  data-testid="ipv4-section"
                  sx={(theme) => ({
                    backgroundColor: theme.tokens.alias.Background.Neutral,
                    padding: theme.spacingFunction(12),
                    marginTop: theme.spacingFunction(8),
                    ...(isIPv4InUse
                      ? {
                          border: `1px solid ${theme.tokens.alias.Border.Positive}`,
                        }
                      : {}),
                  })}
                >
                  <StyledLabel
                    sx={(theme) => ({
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: theme.spacingFunction(4),
                      ...(!isIPv4InUse
                        ? {
                            color:
                              theme.tokens.alias.Content.Text.Primary.Disabled,
                          }
                        : {}),
                    })}
                  >
                    IPv4
                    <Chip
                      data-testid="ipv4-chip"
                      label={isIPv4InUse ? 'in use' : 'not in use'}
                      sx={(theme) => ({
                        background: isIPv4InUse
                          ? theme.tokens.component.Badge.Positive.Subtle
                              .Background
                          : theme.tokens.component.Badge.Neutral.Subtle
                              .Background,
                        color: isIPv4InUse
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
                      ...(!isIPv4InUse
                        ? {
                            color:
                              theme.tokens.alias.Content.Text.Primary.Disabled,
                          }
                        : {}),
                    })}
                  >
                    {prefixListDetails.ipv4!.length > 0 ? (
                      prefixListDetails.ipv4!.join(', ')
                    ) : (
                      <i>no IP addresses</i>
                    )}
                  </StyledListItem>
                </Paper>
              )}

              {isIPv6Supported && (
                <Paper
                  data-testid="ipv6-section"
                  sx={(theme) => ({
                    backgroundColor: theme.tokens.alias.Background.Neutral,
                    padding: theme.spacingFunction(12),
                    marginTop: theme.spacingFunction(8),
                    ...(isIPv6InUse
                      ? {
                          border: `1px solid ${theme.tokens.alias.Border.Positive}`,
                        }
                      : {}),
                  })}
                >
                  <StyledLabel
                    sx={(theme) => ({
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: theme.spacingFunction(4),
                      ...(!isIPv6InUse
                        ? {
                            color:
                              theme.tokens.alias.Content.Text.Primary.Disabled,
                          }
                        : {}),
                    })}
                  >
                    IPv6
                    <Chip
                      data-testid="ipv6-chip"
                      label={isIPv6InUse ? 'in use' : 'not in use'}
                      sx={(theme) => ({
                        background: isIPv6InUse
                          ? theme.tokens.component.Badge.Positive.Subtle
                              .Background
                          : theme.tokens.component.Badge.Neutral.Subtle
                              .Background,
                        color: isIPv6InUse
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
                      ...(!isIPv6InUse
                        ? {
                            color:
                              theme.tokens.alias.Content.Text.Primary.Disabled,
                          }
                        : {}),
                    })}
                  >
                    {prefixListDetails.ipv6!.length > 0 ? (
                      prefixListDetails.ipv6!.join(', ')
                    ) : (
                      <i>no IP addresses</i>
                    )}
                  </StyledListItem>
                </Paper>
              )}
            </>
          )}

          <Box
            sx={(theme) => ({
              marginTop: theme.spacingFunction(16),
              display: 'flex',
              justifyContent: backButtonText ? 'flex-start' : 'flex-end',
            })}
          >
            {backButtonText ? (
              <Button
                buttonType="outlined"
                onClick={() => onClose({ closeAll: false })}
                startIcon={<ArrowLeftIcon />}
                sx={{ textTransform: 'none' }}
              >
                {backButtonText}
              </Button>
            ) : (
              <Button
                buttonType="secondary"
                onClick={() => onClose({ closeAll: false })}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    );
  }
);
