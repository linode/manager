import { useAllFirewallPrefixListsQuery } from '@linode/queries';
import {
  Autocomplete,
  BetaChip,
  Box,
  Button,
  Checkbox,
  CloseIcon,
  IconButton,
  InputLabel,
  Stack,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { useIsFirewallRulesetsPrefixlistsEnabled } from 'src/features/Firewalls/shared';

import { getPrefixListType } from './shared';

import type { FirewallPrefixList } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';
import type { ExtendedPL } from 'src/utilities/ipUtils';

const useStyles = makeStyles()((theme: Theme) => ({
  addPL: {
    '& span:first-of-type': {
      justifyContent: 'flex-start',
    },
    paddingLeft: 0,
    paddingTop: theme.spacingFunction(12),
  },
  button: {
    '& > span': {
      padding: 2,
    },
    marginLeft: `-${theme.spacingFunction(8)}`,
    marginTop: 4,
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
  },
  root: {
    marginTop: theme.spacingFunction(8),
  },
}));

const isPrefixListSupported = (pl: FirewallPrefixList) =>
  (pl.ipv4 !== null && pl.ipv4 !== undefined) ||
  (pl.ipv6 !== null && pl.ipv6 !== undefined);

const getSupportDetails = (pl: FirewallPrefixList) => ({
  isPLIPv4Unsupported: pl.ipv4 === null || pl.ipv4 === undefined,
  isPLIPv6Unsupported: pl.ipv6 === null || pl.ipv6 === undefined,
});

/**
 * Default selection state for a newly chosen Prefix List
 */
const getDefaultPLReferenceState = (
  support: ReturnType<typeof getSupportDetails>
): { inIPv4Rule: boolean; inIPv6Rule: boolean } => {
  const { isPLIPv4Unsupported, isPLIPv6Unsupported } = support;

  if (!isPLIPv4Unsupported && !isPLIPv6Unsupported)
    return { inIPv4Rule: true, inIPv6Rule: false };

  if (!isPLIPv4Unsupported && isPLIPv6Unsupported)
    return { inIPv4Rule: true, inIPv6Rule: false };

  if (isPLIPv4Unsupported && !isPLIPv6Unsupported)
    return { inIPv4Rule: false, inIPv6Rule: true };

  // Should not happen but safe fallback
  return { inIPv4Rule: false, inIPv6Rule: false };
};

export interface MultiplePrefixListInputProps {
  /**
   * Custom CSS class for additional styling.
   */
  className?: string;

  /**
   * Disables the component (non-interactive).
   * @default false
   */
  disabled?: boolean;

  /**
   * Callback triggered when PLs change, passing updated `pls`.
   */
  onChange: (pls: ExtendedPL[]) => void;

  /**
   * Placeholder text for an empty input field.
   */
  placeholder?: string;

  /**
   * Array of `ExtendedPL` objects representing managed PLs.
   */
  pls: ExtendedPL[];
}

export const MultiplePrefixListInput = React.memo(
  (props: MultiplePrefixListInputProps) => {
    const { className, disabled, pls, onChange } = props;
    const { classes, cx } = useStyles();
    const {
      isFirewallRulesetsPrefixlistsFeatureEnabled,
      isFirewallRulesetsPrefixListsBetaEnabled,
    } = useIsFirewallRulesetsPrefixlistsEnabled();
    const { data, isLoading } = useAllFirewallPrefixListsQuery(
      isFirewallRulesetsPrefixlistsFeatureEnabled
    );

    const prefixLists = data ?? [];

    /**
     * Filter prefix lists to include those that support IPv4, IPv6, or both,
     * and map them to options with label, value, and PL IP support details.
     */
    const supportedOptions = React.useMemo(
      () =>
        prefixLists.filter(isPrefixListSupported).map((pl) => ({
          label: pl.name,
          value: pl.id,
          support: getSupportDetails(pl),
        })),
      [prefixLists]
    );

    /**
     * Returns the list of prefix list options available for a specific row.
     * Always includes the currently selected option, and excludes any options
     * that are already selected in other rows. This prevents duplicate prefix
     * list selection across rows.
     */
    const getAvailableOptions = React.useCallback(
      (idx: number, address: string) =>
        supportedOptions.filter(
          (o) =>
            o.label === address || // allow current
            !pls.some((p, i) => i !== idx && p.address === o.label)
        ),
      [supportedOptions, pls]
    );

    const updatePL = (idx: number, updated: Partial<ExtendedPL>) => {
      const newPLs = [...pls];
      newPLs[idx] = { ...newPLs[idx], ...updated };
      onChange(newPLs);
    };

    // Handlers
    const handleSelectPL = (label: string, idx: number) => {
      const match = supportedOptions.find((o) => o.label === label);
      if (!match) return;

      updatePL(idx, {
        address: label,
        ...getDefaultPLReferenceState(match.support),
      });
    };

    const handleToggleIPv4 = (checked: boolean, idx: number) => {
      updatePL(idx, {
        inIPv4Rule: checked,
      });
    };

    const handleToggleIPv6 = (checked: boolean, idx: number) => {
      updatePL(idx, {
        inIPv6Rule: checked,
      });
    };

    const addNewInput = () => {
      onChange([...pls, { address: '', inIPv4Rule: false, inIPv6Rule: false }]);
    };

    const removeInput = (idx: number) => {
      const _pls = [...pls];
      _pls.splice(idx, 1);
      onChange(_pls);
    };

    if (!pls) {
      return null;
    }

    const renderRow = (thisPL: ExtendedPL, idx: number) => {
      const availableOptions = getAvailableOptions(idx, thisPL.address);

      const selectedOption = availableOptions.find(
        (o) => o.label === thisPL.address
      );

      // Disabling a checkbox ensures that at least one option (IPv4 or IPv6) remains checked
      const ipv4Unsupported =
        selectedOption?.support.isPLIPv4Unsupported === true;
      const ipv6Unsupported =
        selectedOption?.support.isPLIPv6Unsupported === true;

      const ipv4Forced =
        thisPL.inIPv4Rule === true && thisPL.inIPv6Rule === false;
      const ipv6Forced =
        thisPL.inIPv6Rule === true && thisPL.inIPv4Rule === false;

      const disableIPv4 = ipv4Unsupported || ipv4Forced;
      const disableIPv6 = ipv6Unsupported || ipv6Forced;

      return (
        <Grid
          container
          data-testid="prefixlist-select"
          direction="row"
          key={`prefixlist-${idx}`}
          spacing={2}
          sx={{
            justifyContent: 'center',
          }}
        >
          <Grid size={11}>
            <Autocomplete
              disableClearable={prefixLists.length > 0}
              disabled={disabled}
              errorText={thisPL.error}
              getOptionLabel={(option) => option.label}
              groupBy={(option) => getPrefixListType(option.label)}
              label=""
              loading={isLoading}
              noMarginTop
              onChange={(_, selectedPrefixList) => {
                handleSelectPL(selectedPrefixList?.label ?? '', idx);
              }}
              options={availableOptions}
              placeholder="Type to search or select a Rule Set"
              value={
                availableOptions.find((o) => o.label === thisPL.address) ?? null
              }
            />
            {thisPL.address.length !== 0 && (
              <Box
                display="flex"
                justifyContent="space-between"
                sx={{ ml: 0.4 }}
              >
                <Box display="flex" gap={2}>
                  <Checkbox
                    checked={thisPL.inIPv4Rule === true}
                    data-testid={`ipv4-checkbox-${idx}`}
                    disabled={disableIPv4 || disabled}
                    onChange={() => handleToggleIPv4(!thisPL.inIPv4Rule, idx)}
                    text="IPv4"
                  />
                  <Checkbox
                    checked={thisPL.inIPv6Rule === true}
                    data-testid={`ipv6-checkbox-${idx}`}
                    disabled={disableIPv6 || disabled}
                    onChange={() => handleToggleIPv6(!thisPL.inIPv6Rule, idx)}
                    text="IPv6"
                  />
                </Box>
                <Box alignItems="center" display="flex">
                  <Link onClick={() => {}}>View Details</Link>
                </Box>
              </Box>
            )}
          </Grid>
          <Grid size={1}>
            <IconButton
              aria-disabled={disabled}
              className={classes.button}
              data-testid="button"
              disabled={disabled}
              onClick={() => removeInput(idx)}
              sx={(theme) => ({
                height: 20,
                width: 20,
                marginTop: `${theme.spacingFunction(16)} !important`,
              })}
            >
              <CloseIcon data-testid={`delete-pl-${idx}`} />
            </IconButton>
          </Grid>
        </Grid>
      );
    };

    return (
      <div className={cx(classes.root, className)}>
        {/* Display the title only when pls.length > 0 (i.e., at least one PL row is added) */}
        {pls.length > 0 && (
          <Box display="flex">
            <InputLabel sx={{ margin: 0 }}>Prefix List</InputLabel>
            {isFirewallRulesetsPrefixListsBetaEnabled && <BetaChip />}
          </Box>
        )}
        <Stack spacing={1}>
          {pls.map((thisPL, idx) => renderRow(thisPL, idx))}
        </Stack>
        <Button
          buttonType="secondary"
          className={classes.addPL}
          compactX
          disabled={disabled}
          onClick={addNewInput}
        >
          Add a Prefix List
        </Button>
      </div>
    );
  }
);
