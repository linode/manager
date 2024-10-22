import Close from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Button } from 'src/components/Button/Button';
import { InputLabel } from 'src/components/InputLabel';
import { LinkButton } from 'src/components/LinkButton';
import { Notice } from 'src/components/Notice/Notice';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

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
    '& :hover, & :focus': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
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
    fontFamily: theme.font.normal,
  },
  root: {
    marginTop: theme.spacing(),
  },
}));

export interface MultipeIPInputProps {
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  forDatabaseAccessControls?: boolean;
  forVPCIPv4Ranges?: boolean;
  helperText?: string;
  inputProps?: InputBaseProps;
  ips: ExtendedIP[];
  isLinkStyled?: boolean;
  onBlur?: (ips: ExtendedIP[]) => void;
  onChange: (ips: ExtendedIP[]) => void;
  placeholder?: string;
  required?: boolean;
  title: string;
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
        <LinkButton onClick={addNewInput}>{buttonText}</LinkButton>
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
            sxTooltipIcon={{
              marginLeft: '-4px',
              marginTop: '-15px',
            }}
            status="help"
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
      {ips.map((thisIP, idx) => (
        <Grid
          container
          data-testid="domain-transfer-input"
          direction="row"
          justifyContent="center"
          key={`domain-transfer-ip-${idx}`}
          maxWidth={forVPCIPv4Ranges ? '415px' : undefined}
          spacing={2}
        >
          <Grid xs={11}>
            <TextField
              InputProps={{
                'aria-label': `${title} ip-address-${idx}`,
                disabled,
                ...props.inputProps,
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(e, idx)
              }
              className={classes.input}
              errorText={thisIP.error}
              hideLabel
              // Prevent unique ID errors, since TextField sets the input element's ID to the label
              label={`domain-transfer-ip-${idx}`}
              onBlur={(e) => handleBlur(e, idx)}
              placeholder={placeholder}
              value={thisIP.address}
            />
          </Grid>
          {/** Don't show the button for the first input since it won't do anything, unless this component is
           * used in DBaaS or for Linode VPC interfaces
           */}
          <Grid xs={1}>
            {(idx > 0 || forDatabaseAccessControls || forVPCIPv4Ranges) && (
              <Button
                className={classes.button}
                disabled={disabled}
                onClick={() => removeInput(idx)}
              >
                <Close data-testid={`delete-ip-${idx}`} />
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
      {addIPButton}
    </div>
  );
});
