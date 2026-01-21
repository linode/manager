import { useAllFirewallPrefixListsQuery } from '@linode/queries';
import { Box, Button, Drawer, Stack, TooltipIcon } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import ArrowLeftIcon from 'src/assets/icons/arrow-left.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

import {
  getFeatureChip,
  useIsFirewallRulesetsPrefixlistsEnabled,
} from '../../shared';
import { PrefixListIPSection } from './FirewallPrefixListIPSection';
import {
  combinePrefixLists,
  getPrefixListType,
  isSpecialPrefixList,
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

export interface PrefixListDrawerContext {
  modeViewedFrom?: FirewallRuleDrawerMode; // Optional in the case of normal rules
  plRuleRef: PrefixListRuleReference;
  type: 'rule' | 'ruleset';
}

export interface FirewallPrefixListDrawerProps {
  category: Category;
  context: PrefixListDrawerContext | undefined;
  isOpen: boolean;
  onClose: (options?: { closeAll: boolean }) => void;
  selectedPrefixListLabel: string | undefined;
}

export const FirewallPrefixListDrawer = React.memo(
  (props: FirewallPrefixListDrawerProps) => {
    const { category, context, onClose, isOpen, selectedPrefixListLabel } =
      props;

    const {
      isFirewallRulesetsPrefixlistsFeatureEnabled,
      isFirewallRulesetsPrefixListsBetaEnabled,
      isFirewallRulesetsPrefixListsGAEnabled,
    } = useIsFirewallRulesetsPrefixlistsEnabled();

    const isPrefixListSpecial = isSpecialPrefixList(selectedPrefixListLabel);

    const { classes } = useStyles();

    const {
      data: apiPL,
      error,
      isFetching,
    } = useAllFirewallPrefixListsQuery(
      // @TODO: Temporarily disabling this API call for `isPrefixListSpecial`
      // since the API doesn't yet support special Prefix Lists.
      // Remove this check and refactor related logic once API support is added.
      isFirewallRulesetsPrefixlistsFeatureEnabled && !isPrefixListSpecial,
      {},
      { name: selectedPrefixListLabel }
    );

    // Merge with hardcoded special PLs
    const prefixLists = React.useMemo(() => combinePrefixLists(apiPL), [apiPL]);

    // Get the actual prefix list by name (name is unique)
    const prefixListDetails = prefixLists.find(
      (pl) => pl.name === selectedPrefixListLabel
    );

    const isIPv4Supported =
      prefixListDetails?.ipv4 !== null && prefixListDetails?.ipv4 !== undefined;
    const isIPv6Supported =
      prefixListDetails?.ipv6 !== null && prefixListDetails?.ipv6 !== undefined;

    const isIPv4InUse = context?.plRuleRef.inIPv4Rule;
    const isIPv6InUse = context?.plRuleRef.inIPv6Rule;

    // Returns Prefix List drawer title and back button text based on category and reference
    const getDrawerTexts = (
      category: Category,
      context?: PrefixListDrawerContext
    ) => {
      const defaultTexts = { title: 'Prefix List details', backButton: null };

      if (!context) return defaultTexts;

      const { type, modeViewedFrom } = context;

      if (type === 'ruleset' && modeViewedFrom === 'create') {
        return {
          title: `Add an ${capitalize(category)} Rule or Rule Set`,
          backButton: `Back to ${capitalize(category)} Rule Set`,
        };
      }

      if (type === 'rule' && modeViewedFrom === 'create') {
        return {
          title: `Add an ${capitalize(category)} Rule or Rule Set`,
          backButton: `Back to ${capitalize(category)} Rule`,
        };
      }

      if (type === 'ruleset' && modeViewedFrom === 'view') {
        return {
          title: `${capitalize(category)} Rule Set details`,
          backButton: 'Back to the Rule Set',
        };
      }

      if (type === 'rule' && modeViewedFrom === 'edit') {
        return { title: 'Edit Rule', backButton: 'Back to Rule' };
      }

      return defaultTexts;
    };

    const { title: titleText, backButton: backButtonText } = getDrawerTexts(
      category,
      context
    );

    const plFieldLabel =
      context?.type === 'rule' && context.modeViewedFrom === undefined
        ? 'Name'
        : 'Prefix List Name';

    const drawerFooter = (
      <Box
        sx={(theme) => ({
          marginTop: theme.spacingFunction(16),
          display: 'flex',
          justifyContent: backButtonText ? 'flex-start' : 'flex-end',
        })}
      >
        <Button
          buttonType={backButtonText ? 'outlined' : 'secondary'}
          onClick={() => onClose({ closeAll: false })}
          startIcon={backButtonText ? <ArrowLeftIcon /> : undefined}
          sx={{
            ...(backButtonText && {
              textTransform: 'none',
            }),
          }}
        >
          {backButtonText ?? 'Close'}
        </Button>
      </Box>
    );

    // For normal Prefix Lists: display all fields.
    // For special Prefix Lists: display only 'Name' or 'Prefix List Name' and 'Description'.
    const fields = [
      {
        label: plFieldLabel,
        value: prefixListDetails?.name ?? selectedPrefixListLabel,
      },
      !isPrefixListSpecial && {
        label: 'ID',
        value: prefixListDetails?.id,
        copy: true,
      },
      {
        label: 'Description',
        value: prefixListDetails?.description,
        column: true,
      },
      !isPrefixListSpecial &&
        prefixListDetails?.name && {
          label: 'Type',
          value: getPrefixListType(prefixListDetails.name),
        },
      !isPrefixListSpecial &&
        prefixListDetails?.visibility && {
          label: 'Visibility',
          value: capitalize(prefixListDetails.visibility),
        },
      !isPrefixListSpecial && {
        label: 'Version',
        value: prefixListDetails?.version,
      },
      !isPrefixListSpecial &&
        prefixListDetails?.created && {
          label: 'Created',
          value: <DateTimeDisplay value={prefixListDetails.created} />,
        },
      !isPrefixListSpecial &&
        prefixListDetails?.updated && {
          label: 'Updated',
          value: <DateTimeDisplay value={prefixListDetails.updated} />,
        },
    ].filter(Boolean) as {
      column?: boolean;
      copy?: boolean;
      label: string;
      value: React.ReactNode;
    }[];

    return (
      <Drawer
        error={error}
        handleBackNavigation={
          backButtonText ? () => onClose({ closeAll: false }) : undefined
        }
        isFetching={isFetching}
        onClose={() => onClose({ closeAll: true })}
        open={isOpen}
        title={titleText}
        titleSuffix={
          getFeatureChip({
            isFirewallRulesetsPrefixlistsFeatureEnabled,
            isFirewallRulesetsPrefixListsBetaEnabled,
            isFirewallRulesetsPrefixListsGAEnabled,
          }) ?? undefined
        }
      >
        <Box mt={2}>
          {prefixListDetails && (
            <>
              {fields.map((item, idx) => (
                <StyledListItem
                  fieldsMode
                  key={`item-${idx}`}
                  paddingMultiplier={2}
                  sx={item.column ? { flexDirection: 'column' } : {}}
                >
                  {item.label && (
                    <StyledLabel component="span">{item.label}:</StyledLabel>
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

              {!isPrefixListSpecial && prefixListDetails.deleted && (
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
              {!isPrefixListSpecial && (
                <Stack gap={2} marginTop={1}>
                  {isIPv4Supported && (
                    <PrefixListIPSection
                      addresses={prefixListDetails.ipv4!}
                      inUse={Boolean(isIPv4InUse)}
                      type="IPv4"
                    />
                  )}
                  {isIPv6Supported && (
                    <PrefixListIPSection
                      addresses={prefixListDetails.ipv6!}
                      inUse={Boolean(isIPv6InUse)}
                      type="IPv6"
                    />
                  )}
                </Stack>
              )}
            </>
          )}

          {drawerFooter}
        </Box>
      </Drawer>
    );
  }
);
