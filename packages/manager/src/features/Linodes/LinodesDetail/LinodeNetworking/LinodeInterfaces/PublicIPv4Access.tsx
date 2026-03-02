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

import { PUBLIC_IPV4_ACCESS_CHECKBOX_TOOLTIP } from 'src/features/VPCs/constants';

interface Props {
  checked?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  isConfigInterface?: boolean;
  onChange: (ipv4Access: null | string) => void;
}

export const PublicIPv4Access = (props: Props) => {
  const { checked, disabled, isConfigInterface, errorMessage, onChange } =
    props;

  return (
    <Box>
      {errorMessage && <Notice text={errorMessage} variant="error" />}
      <FormControlLabel
        checked={checked}
        control={<Checkbox />}
        disabled={disabled}
        label={
          <Stack alignItems="center" direction="row" mt={0}>
            <Typography>Allow public IPv4 access (1:1 NAT)</Typography>
            <TooltipIcon
              status="info"
              text={PUBLIC_IPV4_ACCESS_CHECKBOX_TOOLTIP}
            />
          </Stack>
        }
        onChange={() =>
          onChange(checked ? null : isConfigInterface ? 'any' : 'auto')
        }
        sx={{ pl: 0.3 }}
      />
    </Box>
  );
};
