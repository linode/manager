import {
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import * as React from 'react';
import type { ChangeEvent } from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { ipV6FieldPlaceholder } from 'src/utilities/ipUtils';

import type { APIError } from '@linode/api-v4/lib/types';
import type { Theme } from '@mui/material/styles';
import type { ExtendedIP } from 'src/utilities/ipUtils';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(3),
    maxWidth: 450,
  },
  header: {
    marginBottom: theme.spacing(0.5),
  },
  multipleIPInput: {
    marginLeft: theme.spacing(4),
  },
  subHeader: {
    marginTop: theme.spacing(2),
  },
}));

export type AccessOption = 'none' | 'specific';
export type AccessVariant = 'networking' | 'standard';

export interface AccessProps {
  disabled?: boolean;
  errors?: APIError[];
  ips: ExtendedIP[];
  onBlur: (ips: ExtendedIP[]) => void;
  onChange: (ips: ExtendedIP[]) => void;
  variant?: AccessVariant;
}

export const DatabaseCreateAccessControls = (props: AccessProps) => {
  const {
    disabled = false,
    errors,
    ips,
    onBlur,
    onChange,
    variant = 'standard',
  } = props;
  const { classes } = useStyles();
  const [accessOption, setAccessOption] = useState<AccessOption>('specific');

  const handleAccessOptionChange = (_: ChangeEvent, value: AccessOption) => {
    setAccessOption(value);
    if (value === 'none') {
      onChange([{ address: '', error: '' }]);
    }
  };

  return (
    <Grid>
      <Typography
        className={classes.header}
        variant={variant === 'networking' ? 'h3' : 'h2'}
      >
        Manage Access
      </Typography>
      <Typography>
        Add IPv6 (recommended) or IPv4 addresses or ranges that should be
        authorized to access this cluster.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/aiven-manage-database#ipv6-support">
          Learn more
        </Link>
        .
      </Typography>
      <Typography className={classes.subHeader}>
        (Note: You can modify access controls after your database cluster is
        active.)
      </Typography>

      <Grid className={classes.container}>
        {errors &&
          errors.map((apiError: APIError) => (
            <Notice
              key={apiError.reason}
              text={apiError.reason}
              variant="error"
            />
          ))}
        <RadioGroup
          aria-label="type"
          name="type"
          onChange={handleAccessOptionChange}
          value={accessOption}
        >
          <FormControlLabel
            control={<Radio />}
            data-qa-dbaas-radio="Specific"
            disabled={disabled}
            label="Specific Access (recommended)"
            value="specific"
          />
          <MultipleIPInput
            buttonText={ips.length > 1 ? 'Add Another IP' : 'Add an IP'}
            className={classes.multipleIPInput}
            disabled={accessOption === 'none' || disabled}
            ips={ips}
            onBlur={onBlur}
            onChange={onChange}
            placeholder={ipV6FieldPlaceholder}
            title="Allowed IP Addresses or Ranges"
          />
          <FormControlLabel
            control={<Radio />}
            data-qa-dbaas-radio="None"
            disabled={disabled}
            label="No Access (Deny connections from all IP addresses)"
            value="none"
          />
        </RadioGroup>
      </Grid>
    </Grid>
  );
};
