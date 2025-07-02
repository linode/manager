import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  NewFeatureChip,
  Radio,
  RadioGroup,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';

export interface APLProps {
  isSectionDisabled: boolean;
  setAPL: (apl: boolean) => void;
  setHighAvailability: (ha: boolean | undefined) => void;
}

export const APLCopy = () => (
  <Typography>
    Add a pre-paved path to build, deploy, monitor and secure applications.
    <br />
    <Link to="https://techdocs.akamai.com/cloud-computing/docs/application-platform">
      Learn more about Akamai App Platform.
    </Link>
  </Typography>
);

export const ApplicationPlatform = (props: APLProps) => {
  const { setAPL, setHighAvailability, isSectionDisabled } = props;
  const [selectedValue, setSelectedValue] = React.useState<
    'no' | 'yes' | undefined
  >(isSectionDisabled ? 'no' : undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === 'yes' || value === 'no') {
      setSelectedValue(value);
      setAPL(value === 'yes');
      setHighAvailability(value === 'yes');
    }
  };

  return (
    <FormControl data-testid="application-platform-form">
      <FormLabel
        sx={(theme) => ({
          color: theme.tokens.alias.Typography.Label.Bold.S,
        })}
      >
        <Box alignItems="center" display="flex" flexDirection="row">
          <Typography data-testid="apl-label" variant="inherit">
            Akamai App Platform
          </Typography>
          {!isSectionDisabled && <NewFeatureChip />}
          {isSectionDisabled && (
            <Chip color="primary" label="Coming Soon" sx={{ ml: 1 }} />
          )}
        </Box>
      </FormLabel>
      <APLCopy />
      <RadioGroup onChange={handleChange} value={selectedValue || ''}>
        <FormControlLabel
          control={
            <Radio
              checked={selectedValue === 'yes'}
              data-testid="apl-radio-button-yes"
            />
          }
          disabled={isSectionDisabled}
          label="Yes, enable Akamai App Platform"
          value="yes"
        />
        <FormControlLabel
          control={
            <Radio
              checked={selectedValue === 'no'}
              data-testid="apl-radio-button-no"
            />
          }
          disabled={isSectionDisabled}
          label="No"
          value="no"
        />
      </RadioGroup>
    </FormControl>
  );
};
