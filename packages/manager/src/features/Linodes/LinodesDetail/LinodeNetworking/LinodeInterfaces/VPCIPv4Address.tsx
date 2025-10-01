import {
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  TooltipIcon,
} from '@linode/ui';
import type { JSX } from 'react';
import React from 'react';

interface Props {
  disabled?: boolean;
  errorMessage?: string;
  fieldValue?: null | string;
  helperText?: JSX.Element | null | string;
  ipv4Address?: string;
  onBlur?: () => void;
  onChange: (ipv4Address: string) => void;
}

export const VPCIPv4Address = (props: Props) => {
  const {
    errorMessage,
    fieldValue,
    onBlur,
    disabled,
    onChange,
    helperText,
    ipv4Address,
  } = props;

  return (
    <Stack rowGap={1}>
      <Stack direction="row">
        <FormControlLabel
          checked={fieldValue === 'auto'}
          control={<Checkbox />}
          disabled={disabled}
          label="Auto-assign VPC IPv4 address"
          onChange={(e, checked) =>
            onChange(checked ? 'auto' : (ipv4Address ?? ''))
          }
          sx={{ pl: 0.4, mr: 0 }}
        />
        {helperText && <TooltipIcon status="info" text={helperText} />}
      </Stack>
      {fieldValue !== 'auto' && (
        <TextField
          containerProps={{ sx: { mb: 1.5, mt: 1 } }}
          errorText={errorMessage}
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
