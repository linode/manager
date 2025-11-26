import { useAllFirewallPrefixListsQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CloseIcon,
  IconButton,
  InputLabel,
  LinkButton,
  Notice,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { useIsFirewallRulesetsPrefixlistsEnabled } from 'src/features/Firewalls/shared';

import { getPrefixListType } from './shared';

import type { InputBaseProps } from '@mui/material/InputBase';
import type { Theme } from '@mui/material/styles';
import type { ExtendedPL } from 'src/utilities/ipUtils';

const useStyles = makeStyles()((theme: Theme) => ({
  addIP: {
    '& span:first-of-type': {
      justifyContent: 'flex-start',
    },
    paddingLeft: 0,
    paddingTop: theme.spacing(1.5),
  },
  button: {
    '& > span': {
      padding: 2,
    },
    marginLeft: `-${theme.spacing()}`,
    marginTop: 4,
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
  },
  helperText: {
    marginBottom: theme.spacing(),
  },
  input: {
    'nth-child(n+2)': {
      marginTop: theme.spacing(),
    },
  },
  ipNetmaskTooltipSection: {
    display: 'flex',
    flexDirection: 'row',
  },
  required: {
    font: theme.font.normal,
  },
  root: {
    marginTop: theme.spacing(),
  },
}));

export interface MultiplePrefixListInputProps {
  /**
   * Text displayed on the button.
   */
  buttonText?: string;

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
   * Error message for invalid input.
   */
  error?: string;

  /**
   * Helper text for additional guidance.
   */
  helperText?: string;

  /**
   * Custom input properties passed to the underlying input component.
   */
  inputProps?: InputBaseProps;

  /**
   * Styles the button as a link.
   * @default false
   */
  isLinkStyled?: boolean;

  //   /**
  //    * Callback triggered when the input loses focus, passing updated `ips`.
  //    */
  //   onBlur?: (ips: ExtendedIP[]) => void;

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
   * Indicates if the input is required for form submission.
   * @default false
   */
  required?: boolean;

  /**
   * Title or label for the input field.
   */
  title: string;

  /**
   * Tooltip text for extra info on hover.
   */
  tooltip?: string;
}

export const MultiplePrefixListInput = React.memo(
  (props: MultiplePrefixListInputProps) => {
    const {
      buttonText,
      className,
      disabled,
      error,
      //   forPLs,
      helperText,
      pls,
      isLinkStyled,
      //   onBlur,
      onChange,
      //   placeholder,
      required,
      title,
      tooltip,
    } = props;
    const { classes, cx } = useStyles();
    const { isFirewallRulesetsPrefixlistsFeatureEnabled } =
      useIsFirewallRulesetsPrefixlistsEnabled();
    const { data, isLoading } = useAllFirewallPrefixListsQuery(
      isFirewallRulesetsPrefixlistsFeatureEnabled
    );

    const prefixLists = data ?? [];

    // const prefixLists: Partial<FirewallPrefixList>[] = [
    //   { id: 1, name: 'pl::subnets:325584', ipv6: ['asdas'] },
    //   { id: 2, name: 'pl::vpcs:298694', ipv4: [], ipv6: [] },
    //   {
    //     id: 3,
    //     name: 'pl:system:test-3',
    //     ipv4: ['192.168.0'],
    //     ipv6: null,
    //   },
    //   { id: 4, name: 'pl:system:test-4', ipv4: null, ipv6: ['124.4124.124'] },
    //   { id: 5, name: 'pl:system:test-5', ipv4: null, ipv6: null },
    // ];

    const prefixListDropdownOptions = React.useMemo(
      () =>
        prefixLists
          .filter((pl) => {
            const isUnsupported =
              (pl.ipv4 === null || pl.ipv4 === undefined) &&
              (pl.ipv6 === null || pl.ipv6 === undefined);
            return !isUnsupported;
          })
          .map((pl) => ({
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
      prefixListDropdownOptions.filter(
        (o) =>
          o.label === address || // allow current
          !pls.some((p, i) => i !== idx && p.address === o.label)
      );

    const handleChange = (pl: string, idx: number) => {
      const newPLs = [...pls];

      newPLs[idx].address = pl;

      const plNotSupportedDetails = prefixListDropdownOptions.find(
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

      const details = prefixListDropdownOptions.find(
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

      const details = prefixListDropdownOptions.find(
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

    const addPrefixListButton = isLinkStyled ? (
      <StyledLinkButtonBox
        sx={{
          marginTop: isLinkStyled ? '8px' : '12px',
        }}
      >
        <LinkButton disabled={disabled} onClick={addNewInput}>
          {buttonText}
        </LinkButton>
      </StyledLinkButtonBox>
    ) : (
      <Button
        buttonType="secondary"
        className={classes.addIP}
        compactX
        disabled={disabled}
        onClick={addNewInput}
      >
        {buttonText ?? 'Add a Prefix List'}
      </Button>
    );

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
          data-testid="domain-transfer-input"
          direction="row"
          key={`domain-transfer-ip-${idx}`}
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
        {tooltip && title ? (
          <div className={classes.ipNetmaskTooltipSection}>
            <InputLabel>{title}</InputLabel>
            <TooltipIcon
              status="info"
              sxTooltipIcon={{
                marginLeft: '-4px',
                marginTop: '-15px',
              }}
              text={tooltip}
              tooltipPosition="right"
            />
          </div>
        ) : (
          // There are a couple of instances in the codebase where an empty string is passed as the title so a title isn't displayed.
          // Having this check ensures we don't render an empty label element (which can still impact spacing) in those cases.
          title && (
            <InputLabel sx={{ margin: 0 }}>
              {title}
              {required ? (
                <span className={classes.required}> (required)</span>
              ) : null}
            </InputLabel>
          )
        )}
        {helperText && (
          <Typography className={classes.helperText}>{helperText}</Typography>
        )}
        {error && <Notice spacingTop={8} text={error} variant="error" />}
        <Stack spacing={1}>
          {pls.map((thisPL, idx) => renderRow(thisPL, idx))}
        </Stack>
        {addPrefixListButton}
      </div>
    );
  }
);
