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
   * Linode Interfaces use "auto" to auto-assign IP addresses
   * Legacy Config Interfaces use `null` to auto-assign IP addresseses
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

  // Auto-assign should be checked if
  // - the field value matches the identifier
  // - or the field value is undefined (because the API's default behavior is to auto-assign)
  const shouldAutoAssign = fieldValue === autoAssignIdentifier || fieldValue === undefined;

  return (
    <Stack rowGap={1}>
      <Stack direction="row">
        <FormControlLabel
          checked={shouldAutoAssign}
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
      {!shouldAutoAssign && (
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
