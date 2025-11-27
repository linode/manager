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
   * Callback triggered when IPs change, passing updated `ips`.
   */
  onChange: (ips: ExtendedPL[]) => void;

  /**
   * Placeholder text for an empty input field.
   */
  placeholder?: string;

  /**
   * Array of `ExtendedPL` objects representing managed PLs.
   */
  pls: ExtendedPL[];

  /**
   * Title or label for the input field.
   */
  title: string;
}

export const MultiplePrefixListInput = React.memo(
  (props: MultiplePrefixListInputProps) => {
    const { className, disabled, pls, onChange, title } = props;
    const { classes, cx } = useStyles();
    const {
      isFirewallRulesetsPrefixlistsFeatureEnabled,
      isFirewallRulesetsPrefixListsBetaEnabled,
    } = useIsFirewallRulesetsPrefixlistsEnabled();
    const { data, isLoading } = useAllFirewallPrefixListsQuery(
      isFirewallRulesetsPrefixlistsFeatureEnabled
    );

    const prefixLists = data ?? [];

    const isPrefixListSupported = (pl: FirewallPrefixList) =>
      (pl.ipv4 !== null && pl.ipv4 !== undefined) ||
      (pl.ipv6 !== null && pl.ipv6 !== undefined);

    const supportedPrefixListOptions = React.useMemo(
      () =>
        prefixLists.filter(isPrefixListSupported).map((pl) => ({
          label: pl.name,
          value: pl.id,
          notSupportedDetails: {
            isPLIPv4NotSupported: pl.ipv4 === null || pl.ipv4 === undefined,
            isPLIPv6NotSupported: pl.ipv6 === null || pl.ipv6 === undefined,
          },
        })),
      [prefixLists]
    );

    const getAvailableOptions = (idx: number, address: string) =>
      supportedPrefixListOptions.filter(
        (o) =>
          o.label === address || // allow current
          !pls.some((p, i) => i !== idx && p.address === o.label)
      );

    const handleChange = (pl: string, idx: number) => {
      const newPLs = [...pls];

      newPLs[idx].address = pl;

      const plNotSupportedDetails = supportedPrefixListOptions.find(
        (o) => o.label === newPLs[idx].address
      )?.notSupportedDetails;

      const bothIPv4AndIPv6Supported =
        !plNotSupportedDetails?.isPLIPv4NotSupported &&
        !plNotSupportedDetails?.isPLIPv6NotSupported;

      const onlyIPv4Supported =
        !plNotSupportedDetails?.isPLIPv4NotSupported &&
        plNotSupportedDetails?.isPLIPv6NotSupported;

      const onlyIPv6Supported =
        !plNotSupportedDetails?.isPLIPv6NotSupported &&
        plNotSupportedDetails?.isPLIPv4NotSupported;

      if (bothIPv4AndIPv6Supported || onlyIPv4Supported) {
        newPLs[idx].inIPv4Rule = true;
        newPLs[idx].inIPv6Rule = false;
      }

      if (onlyIPv6Supported) {
        newPLs[idx].inIPv4Rule = false;
        newPLs[idx].inIPv6Rule = true;
      }

      onChange(newPLs);
    };

    const handleChangeIPv4 = (hasIPv4: boolean, idx: number) => {
      const newPLs = [...pls];

      const details = supportedPrefixListOptions.find(
        (o) => o.label === newPLs[idx].address
      )?.notSupportedDetails;

      const plSupportsIPv6 = details && !details.isPLIPv6NotSupported;

      newPLs[idx].inIPv4Rule = hasIPv4;

      // If Ipv4 is unchecked then check IpV6 by default if IPv6 is supported by this PL.
      if (!hasIPv4 && !newPLs[idx].inIPv6Rule) {
        if (plSupportsIPv6) {
          newPLs[idx].inIPv6Rule = true;
        }
      }
      onChange(newPLs);
    };

    const handleChangeIPv6 = (hasIPv6: boolean, idx: number) => {
      const newPLs = [...pls];

      const details = supportedPrefixListOptions.find(
        (o) => o.label === newPLs[idx].address
      )?.notSupportedDetails;

      const plSupportsIPv4 = details && !details.isPLIPv4NotSupported;

      newPLs[idx].inIPv6Rule = hasIPv6;

      // If Ipv6 is unchecked then check IpV4 by default if IPv4 is supported by this PL.
      if (!hasIPv6 && !newPLs[idx].inIPv4Rule) {
        if (plSupportsIPv4) {
          newPLs[idx].inIPv4Rule = true;
        }
      }
      onChange(newPLs);
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

      const ipv4Unsupported =
        selectedOption?.notSupportedDetails.isPLIPv4NotSupported === true;
      const ipv6Unsupported =
        selectedOption?.notSupportedDetails.isPLIPv6NotSupported === true;

      // Prevent both being unchecked
      const ipv4Forced =
        thisPL.inIPv4Rule === true && thisPL.inIPv6Rule === false;
      const ipv6Forced =
        thisPL.inIPv6Rule === true && thisPL.inIPv4Rule === false;

      const disableIPv4 = ipv4Unsupported === true || ipv4Forced === true;
      const disableIPv6 = ipv6Unsupported === true || ipv6Forced === true;

      return (
        <Grid
          container
          direction="row"
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
                handleChange(selectedPrefixList?.label ?? '', idx);
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
                    disabled={disableIPv4 === true || disabled}
                    onChange={() => handleChangeIPv4(!thisPL.inIPv4Rule, idx)}
                    text="IPv4"
                  />
                  <Checkbox
                    checked={thisPL.inIPv6Rule === true}
                    disabled={disableIPv6 === true || disabled}
                    onChange={() => handleChangeIPv6(!thisPL.inIPv6Rule, idx)}
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
        {title && (
          <Box display="flex">
            <InputLabel sx={{ margin: 0 }}>{title}</InputLabel>
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
