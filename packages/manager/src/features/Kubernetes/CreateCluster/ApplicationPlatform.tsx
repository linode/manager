import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
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

const APL_UNSUPPORTED_CHIP_COPY = ' - COMING SOON';

export const ApplicationPlatform = (props: APLProps) => {
  const { isSectionDisabled, setAPL, setHighAvailability } = props;

  const [isAPLChecked, setIsAPLChecked] = React.useState<boolean | undefined>(
    isSectionDisabled ? false : undefined
  );
  const [isAPLNotChecked, setIsAPLNotChecked] = React.useState<
    boolean | undefined
  >(isSectionDisabled ? true : undefined);

  /**
   * Reset the radio buttons to the correct default state once the user toggles cluster tiers.
   */
  React.useEffect(() => {
    setIsAPLChecked(isSectionDisabled ? false : undefined);
    setIsAPLNotChecked(isSectionDisabled ? true : undefined);
  }, [isSectionDisabled]);

  const CHIP_COPY = `BETA${isSectionDisabled ? APL_UNSUPPORTED_CHIP_COPY : ''}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAPL(e.target.value === 'yes');
    setHighAvailability(e.target.value === 'yes');
  };

  return (
    <FormControl data-testid="application-platform-form">
      <FormLabel
        sx={(theme) => ({
          '&&.MuiFormLabel-root.Mui-focused': {
            color:
              theme.name === 'dark'
                ? theme.tokens.color.Neutrals.White
                : theme.color.black,
          },
        })}
      >
        <Box alignItems="center" display="flex" flexDirection="row">
          <Typography data-testid="apl-label">Akamai App Platform</Typography>
          <Chip
            color="primary"
            data-testid="apl-beta-chip"
            label={CHIP_COPY}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
      </FormLabel>
      <APLCopy />
      <RadioGroup onChange={(e) => handleChange(e)}>
        <FormControlLabel
          checked={isAPLChecked}
          control={<Radio data-testid="apl-radio-button-yes" />}
          disabled={isSectionDisabled}
          label="Yes, enable Akamai App Platform."
          name="yes"
          value="yes"
        />
        <FormControlLabel
          checked={isAPLNotChecked}
          control={<Radio data-testid="apl-radio-button-no" />}
          disabled={isSectionDisabled}
          label="No"
          name="no"
          value="no"
        />
      </RadioGroup>
    </FormControl>
  );
};
