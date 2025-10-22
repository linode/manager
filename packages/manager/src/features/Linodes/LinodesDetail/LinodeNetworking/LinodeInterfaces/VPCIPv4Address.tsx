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
  /**
   * Linode Interfaces uses "auto" to auto-assign IP addresses.
   * Legacy Config interfaces use null to auto-assign IP addresses.
   */
  autoAssignIdentifier: 'auto' | null;
  disabled?: boolean;
  errorMessage?: string;
  fieldValue?: null | string;
  ipv4Address?: string;
  onBlur?: () => void;
  onChange: (ipv4Address: null | string) => void;
}

export const VPCIPv4Address = (props: Props) => {
  const {
    errorMessage,
    fieldValue,
    onBlur,
    disabled,
    onChange,
    ipv4Address,
    autoAssignIdentifier,
  } = props;

  return (
    <Stack rowGap={1}>
      <Stack direction="row">
        <FormControlLabel
          checked={
            fieldValue === autoAssignIdentifier || fieldValue === undefined
          }
          control={<Checkbox />}
          disabled={disabled}
          label="Auto-assign VPC IPv4"
          onChange={(e, checked) =>
            onChange(checked ? autoAssignIdentifier : (ipv4Address ?? ''))
          }
          sx={{ pl: 0.4, mr: 0 }}
        />
        <TooltipIcon status="info" text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP} />
      </Stack>
      {fieldValue !== autoAssignIdentifier && fieldValue !== undefined && (
        <TextField
          containerProps={{ sx: { mb: 1.5, mt: 1 } }}
          errorText={errorMessage}
          helperText={VPC_IPV4_INPUT_HELPER_TEXT}
          label="VPC IPv4"
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
