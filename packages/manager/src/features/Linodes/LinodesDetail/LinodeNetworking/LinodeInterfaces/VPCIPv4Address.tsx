import {
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  TooltipIcon,
} from '@linode/ui';
import React from 'react';

import {
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
  VPC_IPV4_INPUT_HELPER_TEXT,
} from 'src/features/VPCs/constants';

interface Props {
  disabled?: boolean;
  errorMessage?: string;
  fieldValue?: null | string;
  ipv4Address?: string;
  onBlur?: () => void;
  onChange: (ipv4Address: string) => void;
}

export const VPCIPv4Address = (props: Props) => {
  const { errorMessage, fieldValue, onBlur, disabled, onChange, ipv4Address } =
    props;

  return (
    <Stack rowGap={1}>
      <Stack direction="row">
        <FormControlLabel
          checked={fieldValue === 'auto'}
          control={<Checkbox />}
          disabled={disabled}
          label="Auto-assign VPC IPv4"
          onChange={(e, checked) =>
            onChange(checked ? 'auto' : (ipv4Address ?? ''))
          }
          sx={{ pl: 0.4, mr: 0 }}
        />
        <TooltipIcon status="info" text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP} />
      </Stack>
      {fieldValue !== 'auto' && (
        <TextField
          containerProps={{ sx: { mb: 1.5, mt: 1 } }}
          errorText={errorMessage}
          helperText={VPC_IPV4_INPUT_HELPER_TEXT}
          label="VPC IPv4"
          noMarginTop
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          // eslint-disable-next-line sonarjs/no-hardcoded-ip
          placeholder="10.0.0.5"
          required
          value={fieldValue}
        />
      )}
    </Stack>
  );
};
