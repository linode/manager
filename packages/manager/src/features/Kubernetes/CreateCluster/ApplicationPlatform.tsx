import {
  Box,
  FormControl,
  FormControlLabel,
  NewFeatureChip,
  Radio,
  RadioGroup,
  styled,
  StyledBetaChip,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';

import type { BetaChipProps } from '@linode/ui';

export interface APLProps {
  isEnterpriseTier?: boolean;
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
  const {
    setAPL,
    setHighAvailability,
    isSectionDisabled,
    isEnterpriseTier = false,
  } = props;
  const [selectedValue, setSelectedValue] = React.useState<
    'no' | 'yes' | undefined
  >(isSectionDisabled ? 'no' : undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === 'yes' || value === 'no') {
      setSelectedValue(value);
      setAPL(value === 'yes');
      // For Enterprise clusters, HA is already enabled by default, so don't enforce it when APL is enabled
      if (!isEnterpriseTier) {
        setHighAvailability(value === 'yes');
      }
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
          {isSectionDisabled ? (
            <StyledComingSoonChip
              data-testid="apl-coming-soon-chip"
              label="coming soon"
            />
          ) : (
            <NewFeatureChip />
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
              checked={selectedValue === 'no' || isSectionDisabled}
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

const StyledComingSoonChip = styled(StyledBetaChip, {
  label: 'StyledComingSoonChip',
  shouldForwardProp: (prop) => prop !== 'color',
})<BetaChipProps>(({ theme }) => ({
  background: theme.tokens.color.Brand[80],
  textTransform: theme.tokens.font.Textcase.Uppercase,
}));
