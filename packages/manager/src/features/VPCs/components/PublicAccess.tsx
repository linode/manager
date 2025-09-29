import {
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';

import {
  PUBLIC_IPV4_ACCESS_CHECKBOX_TOOLTIP,
  PUBLIC_IPV6_ACCESS_CHECKBOX_TOOLTIP,
} from '../constants';

import type { SxProps, Theme } from '@linode/ui';

interface Props {
  allowPublicIPv4Access: boolean;
  allowPublicIPv6Access: boolean;
  handleAllowPublicIPv4AccessChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleAllowPublicIPv6AccessChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  showIPv6Content: boolean;
  sx?: SxProps<Theme>;
  userCannotAssignLinodes: boolean;
}

export const PublicAccess = (props: Props) => {
  const {
    allowPublicIPv4Access,
    allowPublicIPv6Access,
    handleAllowPublicIPv4AccessChange,
    handleAllowPublicIPv6AccessChange,
    showIPv6Content,
    sx,
    userCannotAssignLinodes,
  } = props;

  return (
    <>
      <Divider sx={sx} />
      <Typography sx={(theme: Theme) => ({ font: theme.font.bold })}>
        Public access
      </Typography>
      <FormControlLabel
        checked={allowPublicIPv4Access}
        control={<Checkbox sx={{ ml: 0.4 }} />}
        disabled={userCannotAssignLinodes}
        label={
          <Stack alignItems="center" direction="row">
            <Typography>Allow public IPv4 access (1:1 NAT)</Typography>
            <TooltipIcon
              status="info"
              text={PUBLIC_IPV4_ACCESS_CHECKBOX_TOOLTIP}
            />
          </Stack>
        }
        onChange={handleAllowPublicIPv4AccessChange}
      />
      {showIPv6Content && (
        <FormControlLabel
          checked={allowPublicIPv6Access}
          control={<Checkbox sx={{ ml: 0.4 }} />}
          disabled={userCannotAssignLinodes}
          label={
            <Stack alignItems="center" direction="row">
              <Typography>Allow public IPv6 access</Typography>
              <TooltipIcon
                status="info"
                text={PUBLIC_IPV6_ACCESS_CHECKBOX_TOOLTIP}
              />
            </Stack>
          }
          onChange={handleAllowPublicIPv6AccessChange}
        />
      )}
    </>
  );
};
