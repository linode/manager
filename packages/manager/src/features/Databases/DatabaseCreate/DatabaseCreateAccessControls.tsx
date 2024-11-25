import { Notice, Radio, RadioGroup, Typography } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import { useState } from 'react';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { ipFieldPlaceholder } from 'src/utilities/ipUtils';

import { useIsDatabasesEnabled } from '../utilities';

import type { APIError } from '@linode/api-v4/lib/types';
import type { Theme } from '@mui/material/styles';
import type { ChangeEvent } from 'react';
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

interface Props {
  disabled?: boolean;
  errors?: APIError[];
  ips: ExtendedIP[];
  onBlur: (ips: ExtendedIP[]) => void;
  onChange: (ips: ExtendedIP[]) => void;
}

export const DatabaseCreateAccessControls = (props: Props) => {
  const { disabled = false, errors, ips, onBlur, onChange } = props;
  const { classes } = useStyles();
  const [accessOption, setAccessOption] = useState<AccessOption>('specific');
  const { isDatabasesV2GA } = useIsDatabasesEnabled();

  const handleAccessOptionChange = (_: ChangeEvent, value: AccessOption) => {
    setAccessOption(value);
    if (value === 'none') {
      onChange([{ address: '', error: '' }]);
    }
  };

  return (
    <Grid>
      <Typography className={classes.header} variant="h2">
        Add Access Controls
      </Typography>
      {isDatabasesV2GA ? (
        <>
          <Typography>
            Add IPv4 addresses or ranges that should be authorized to access
            this cluster.
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-access-controls">
              Learn more
            </Link>
            .
          </Typography>
          <Typography className={classes.subHeader}>
            (Note: You can modify access controls after your database cluster is
            active.)
          </Typography>
        </>
      ) : (
        <>
          <Typography>
            Add any IPv4 address or range that should be authorized to access
            this cluster.
          </Typography>
          <Typography>
            By default, all public and private connections are denied.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-access-controls">
              Learn more
            </Link>
            .
          </Typography>
          <Typography className={classes.subHeader}>
            You can add or modify access controls after your database cluster is
            active.{' '}
          </Typography>
        </>
      )}
      <Grid className={classes.container}>
        {errors &&
          errors.map((apiError: APIError) => (
            <Notice
              key={apiError.reason}
              text={apiError.reason}
              variant="error"
            />
          ))}
        {isDatabasesV2GA ? (
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
              className={classes.multipleIPInput}
              disabled={accessOption === 'none' || disabled}
              ips={ips}
              onBlur={onBlur}
              onChange={onChange}
              placeholder={ipFieldPlaceholder}
              title="Allowed IP Address(es) or Range(s)"
            />
            <FormControlLabel
              control={<Radio />}
              data-qa-dbaas-radio="None"
              disabled={disabled}
              label="No Access (Deny connections from all IP addresses)"
              value="none"
            />
          </RadioGroup>
        ) : (
          <MultipleIPInput
            disabled={disabled}
            ips={ips}
            onBlur={onBlur}
            onChange={onChange}
            placeholder={ipFieldPlaceholder}
            title="Allowed IP Address(es) or Range(s)"
          />
        )}
      </Grid>
    </Grid>
  );
};
