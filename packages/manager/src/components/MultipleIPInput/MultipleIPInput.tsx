import {
  Button,
  CloseIcon,
  IconButton,
  InputLabel,
  Notice,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { LinkButton } from 'src/components/LinkButton';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';

import type { InputBaseProps } from '@mui/material/InputBase';
import type { Theme } from '@mui/material/styles';
import type { ExtendedIP } from 'src/utilities/ipUtils';

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

export interface MultipeIPInputProps {
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
   * Indicates if the input relates to database access controls.
   * @default false
   */
  forDatabaseAccessControls?: boolean;

  /**
   * Indicates if the input is for VPC IPv4 ranges.
   * @default false
   */
  forVPCIPv4Ranges?: boolean;

  /**
   * Helper text for additional guidance.
   */
  helperText?: string;

  /**
   * Custom input properties passed to the underlying input component.
   */
  inputProps?: InputBaseProps;

  /**
   * Array of `ExtendedIP` objects representing managed IPs.
   */
  ips: ExtendedIP[];

  /**
   * Styles the button as a link.
   * @default false
   */
  isLinkStyled?: boolean;

  /**
   * Callback triggered when the input loses focus, passing updated `ips`.
   */
  onBlur?: (ips: ExtendedIP[]) => void;

  /**
   * Callback triggered when IPs change, passing updated `ips`.
   */
  onChange: (ips: ExtendedIP[]) => void;

  /**
   * Placeholder text for an empty input field.
   */
  placeholder?: string;

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

export const MultipleIPInput = React.memo((props: MultipeIPInputProps) => {
  const {
    buttonText,
    className,
    disabled,
    error,
    forDatabaseAccessControls,
    forVPCIPv4Ranges,
    helperText,
    ips,
    isLinkStyled,
    onBlur,
    onChange,
    placeholder,
    required,
    title,
    tooltip,
  } = props;
  const { classes, cx } = useStyles();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const newIPs = [...ips];
    newIPs[idx].address = e.target.value;
    onChange(newIPs);
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    idx: number
  ) => {
    if (!onBlur || e.target.value === '') {
      return;
    }

    const newIPs = [...ips];
    newIPs[idx].address = e.target.value;
    onBlur(newIPs);
  };

  const addNewInput = () => {
    onChange([...ips, { address: '' }]);
  };

  const removeInput = (idx: number) => {
    const _ips = [...ips];
    _ips.splice(idx, 1);
    onChange(_ips);
  };

  if (!ips) {
    return null;
  }

  const addIPButton =
    forVPCIPv4Ranges || isLinkStyled ? (
      <StyledLinkButtonBox sx={{ marginTop: isLinkStyled ? '8px' : '12px' }}>
        <LinkButton isDisabled={disabled} onClick={addNewInput}>
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
        {buttonText ?? 'Add an IP'}
      </Button>
    );

  return (
    <div className={cx(classes.root, className)}>
      {tooltip ? (
        <div className={classes.ipNetmaskTooltipSection}>
          <InputLabel>{title}</InputLabel>
          <TooltipIcon
            status="help"
            sxTooltipIcon={{
              marginLeft: '-4px',
              marginTop: '-15px',
            }}
            text={tooltip}
            tooltipPosition="right"
          />
        </div>
      ) : (
        <InputLabel>
          {title}
          {required ? (
            <span className={classes.required}> (required)</span>
          ) : null}
        </InputLabel>
      )}
      {helperText && (
        <Typography className={classes.helperText}>{helperText}</Typography>
      )}
      {error && <Notice spacingTop={8} text={error} variant="error" />}
      <Stack spacing={1}>
        {ips.map((thisIP, idx) => (
          <Grid
            container
            data-testid="domain-transfer-input"
            direction="row"
            key={`domain-transfer-ip-${idx}`}
            spacing={2}
            sx={{
              justifyContent: 'center',
              maxWidth: forVPCIPv4Ranges ? '415px' : undefined,
            }}
          >
            <Grid size={11}>
              <TextField
                className={classes.input}
                errorText={thisIP.error}
                hideLabel
                InputProps={{
                  'aria-label': `${title} ip-address-${idx}`,
                  disabled,
                  ...props.inputProps,
                }}
                // Prevent unique ID errors, since TextField sets the input element's ID to the label
                label={`domain-transfer-ip-${idx}`}
                onBlur={(e) => handleBlur(e, idx)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e, idx)
                }
                placeholder={placeholder}
                value={thisIP.address}
              />
            </Grid>
            {/** Don't show the button for the first input since it won't do anything, unless this component is
             * used in DBaaS or for Linode VPC interfaces
             */}
            <Grid size={1}>
              {(idx > 0 || forDatabaseAccessControls || forVPCIPv4Ranges) && (
                <IconButton
                  aria-disabled={disabled}
                  className={classes.button}
                  data-testid="button"
                  disabled={disabled}
                  onClick={() => removeInput(idx)}
                >
                  <CloseIcon data-testid={`delete-ip-${idx}`} />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}
      </Stack>
      {addIPButton}
    </div>
  );
});
