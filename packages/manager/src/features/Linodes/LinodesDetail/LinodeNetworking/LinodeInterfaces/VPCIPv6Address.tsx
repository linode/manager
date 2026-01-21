import {
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  TooltipIcon,
} from '@linode/ui';
import React from 'react';

import {
  VPC_AUTO_ASSIGN_IPV6_TOOLTIP,
  VPC_IPV6_INPUT_HELPER_TEXT,
} from 'src/features/VPCs/constants';

interface Props {
  /**
   * Linode Interfaces use "auto" to auto-assign IP addresses
   * Legacy Config Interfaces use `null` to auto-assign IP addresses
   */
  autoAssignValue: 'auto' | null;
  disabled?: boolean;
  errorMessage?: string;
  fieldValue?: null | string;
  ipv6Address?: string;
  onBlur?: () => void;
  onChange: (ipv6Address: null | string) => void;
}

export const VPCIPv6Address = (props: Props) => {
  const {
    errorMessage,
    fieldValue,
    onBlur,
    onChange,
    disabled,
    ipv6Address,
    autoAssignValue,
  } = props;

  // Auto-assign should be checked if any of the following are true
  // - field value is 'auto
  // - field value is undefined
  const shouldAutoAssign =
    fieldValue === autoAssignValue || fieldValue === undefined;

  // Initialize the form value to autoAssignValue if it should auto-assign but is undefined
  if (shouldAutoAssign && fieldValue === undefined) {
    onChange(autoAssignValue);
  }

  return (
    <Stack rowGap={1}>
      <Stack direction="row">
        <FormControlLabel
          checked={shouldAutoAssign}
          control={<Checkbox />}
          disabled={disabled}
          label="Auto-assign VPC IPv6"
          onChange={(e, checked) => {
            onChange(checked ? autoAssignValue : (ipv6Address ?? ''));
          }}
          sx={{ pl: 0.4, mr: 0 }}
        />
        <TooltipIcon status="info" text={VPC_AUTO_ASSIGN_IPV6_TOOLTIP} />
      </Stack>
      {!shouldAutoAssign && (
        <TextField
          errorText={errorMessage}
          helperText={VPC_IPV6_INPUT_HELPER_TEXT}
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
