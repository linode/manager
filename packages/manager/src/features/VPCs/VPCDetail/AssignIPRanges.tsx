import { Box, Divider, Notice, TooltipIcon, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import {
  ASSIGN_IP_RANGES_TITLE,
  ASSIGN_IPV4_RANGES_TITLE,
} from 'src/features/VPCs/constants';

import {
  DualStackVPCRangesDescription,
  VPCRangesDescription,
} from '../components/VPCRangesDescription';

import type { SxProps, Theme } from '@mui/material/styles';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface Props {
  handleIPRangeChange: (ips: ExtendedIP[]) => void;
  handleIPv6RangeChange?: (ips: ExtendedIP[]) => void;
  includeDescriptionInTooltip?: boolean;
  ipRangesError?: string;
  ipv4Ranges: ExtendedIP[];
  ipv6Ranges?: ExtendedIP[];
  ipv6RangesError?: string;
  showIPv6Fields?: boolean;
  sx?: SxProps<Theme>;
}

export const AssignIPRanges = (props: Props) => {
  const {
    handleIPRangeChange,
    handleIPv6RangeChange = () => null,
    includeDescriptionInTooltip,
    ipv4Ranges,
    ipv6Ranges,
    ipRangesError,
    ipv6RangesError,
    showIPv6Fields,
    sx,
  } = props;

  const theme = useTheme();

  const vpcRangesDescription = showIPv6Fields ? (
    <DualStackVPCRangesDescription />
  ) : (
    <VPCRangesDescription />
  );

  return (
    <>
      <Divider sx={sx} />
      {ipRangesError && <Notice text={ipRangesError} variant="error" />}
      {showIPv6Fields && ipv6RangesError && (
        <Notice text={ipv6RangesError} variant="error" />
      )}
      <Box
        alignItems={includeDescriptionInTooltip ? 'center' : 'flex-start'}
        display="flex"
        flexDirection={includeDescriptionInTooltip ? 'row' : 'column'}
      >
        <Typography sx={{ font: theme.font.bold }}>
          {showIPv6Fields ? ASSIGN_IP_RANGES_TITLE : ASSIGN_IPV4_RANGES_TITLE}
        </Typography>
        {includeDescriptionInTooltip ? (
          <TooltipIcon
            status="info"
            sxTooltipIcon={{
              padding: theme.spacingFunction(8),
            }}
            text={vpcRangesDescription}
          />
        ) : (
          vpcRangesDescription
        )}
      </Box>
      <MultipleIPInput
        adjustSpacingForVPCDualStack={showIPv6Fields}
        buttonText="Add IPv4 Range"
        forVPCIPRanges
        ips={ipv4Ranges}
        onChange={handleIPRangeChange}
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        placeholder={showIPv6Fields ? undefined : '10.0.0.0/24'}
        title="" // Empty string so a title isn't displayed for each IP input
      />
      {showIPv6Fields && (
        <MultipleIPInput
          adjustSpacingForVPCDualStack={showIPv6Fields}
          buttonText="Add IPv6 Range"
          forVPCIPRanges
          ips={ipv6Ranges ?? []}
          onChange={handleIPv6RangeChange}
          title="" // Empty string so a title isn't displayed for each IP input
        />
      )}
    </>
  );
};
