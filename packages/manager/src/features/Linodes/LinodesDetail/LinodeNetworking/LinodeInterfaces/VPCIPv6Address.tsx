import {
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  TooltipIcon,
} from '@linode/ui';
import React from 'react';

import { VPC_AUTO_ASSIGN_IPV6_TOOLTIP } from 'src/features/VPCs/constants';

interface Props {
  disabled?: boolean;
  errorMessage?: string;
  fieldValue?: null | string;
  helperText?: null | string;
  ipv6Address?: string;
  onBlur?: () => void;
  onChange: (ipv6Address: string) => void;
}

export const VPCIPv6Address = (props: Props) => {
  const {
    errorMessage,
    fieldValue,
    onBlur,
    onChange,
    helperText,
    disabled,
    ipv6Address,
  } = props;

  return (
    <Stack rowGap={1}>
      <Stack direction="row">
        <FormControlLabel
          checked={fieldValue === 'auto'}
          control={<Checkbox />}
          disabled={disabled}
          label="Auto-assign VPC IPv6 address"
          onChange={(e, checked) => {
            onChange(checked ? 'auto' : (ipv6Address ?? ''));
          }}
          sx={{ pl: 0.4, mr: 0 }}
        />
        <TooltipIcon status="info" text={VPC_AUTO_ASSIGN_IPV6_TOOLTIP} />
      </Stack>
      {fieldValue !== 'auto' && (
        <TextField
          errorText={errorMessage}
          helperText={helperText}
          label="VPC IPv6"
          noMarginTop
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          required
          value={fieldValue}
        />
      )}
    </Stack>
  );
};
