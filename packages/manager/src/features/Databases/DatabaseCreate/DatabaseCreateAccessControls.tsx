import type { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';
import { ExtendedIP, ipFieldPlaceholder } from 'src/utilities/ipUtils';
import { makeStyles } from 'tss-react/mui';
import { useIsDatabasesEnabled } from '../utilities';

const useStyles = makeStyles()((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(0.5),
  },
  subHeader: {
    marginTop: theme.spacing(2),
  },
  container: {
    marginTop: theme.spacing(3),
    maxWidth: 450,
  },
  multipleIPInput: {
    marginLeft: theme.spacing(4),
  },
}));

export type AccessOption = 'specific' | 'none';

interface Props {
  errors?: APIError[];
  ips: ExtendedIP[];
  onBlur: (ips: ExtendedIP[]) => void;
  onChange: (ips: ExtendedIP[]) => void;
}

export const DatabaseCreateAccessControls = (props: Props) => {
  const { errors, ips, onBlur, onChange } = props;
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
              label="Specific Access (recommended)"
              value="specific"
            />
            <MultipleIPInput
              className={classes.multipleIPInput}
              disabled={accessOption === 'none'}
              ips={ips}
              onBlur={onBlur}
              onChange={onChange}
              placeholder={ipFieldPlaceholder}
              title="Allowed IP Address(es) or Range(s)"
            />
            <FormControlLabel
              control={<Radio />}
              data-qa-dbaas-radio="None"
              label="No Access (Deny connections from all IP addresses)"
              value="none"
            />
          </RadioGroup>
        ) : (
          <MultipleIPInput
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
