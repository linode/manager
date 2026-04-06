import {
  Box,
  Checkbox,
  FormControlLabel,
  Notice,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';

import { PUBLIC_IPV6_ACCESS_CHECKBOX_TOOLTIP } from 'src/features/VPCs/constants';

interface Props {
  checked?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  onChange: (checked: boolean) => void;
}

export const PublicIPv6Access = (props: Props) => {
  const { errorMessage, checked, disabled, onChange } = props;

  return (
    <Box>
      {errorMessage && <Notice text={errorMessage} variant="error" />}
      <FormControlLabel
        checked={checked}
        control={<Checkbox />}
        disabled={disabled}
        label={
          <Stack alignItems="center" direction="row">
            <Typography>Allow public IPv6 access</Typography>
            <TooltipIcon
              status="info"
              text={PUBLIC_IPV6_ACCESS_CHECKBOX_TOOLTIP}
            />
          </Stack>
        }
        onChange={() => onChange(!checked)}
        sx={{ pl: 0.3 }}
      />
    </Box>
  );
};
