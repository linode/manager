import { Box, Divider, Notice, TooltipIcon, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { ASSIGN_IPV4_RANGES_TITLE } from 'src/features/VPCs/constants';

import { VPCRangesDescription } from '../components/VPCRangesDescription';

import type { SxProps, Theme } from '@mui/material/styles';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface Props {
  handleIPRangeChange: (ips: ExtendedIP[]) => void;
  includeDescriptionInTooltip?: boolean;
  ipRanges: ExtendedIP[];
  ipRangesError?: string;
  sx?: SxProps<Theme>;
}

export const AssignIPRanges = (props: Props) => {
  const {
    handleIPRangeChange,
    includeDescriptionInTooltip,
    ipRanges,
    ipRangesError,
    sx,
  } = props;

  const theme = useTheme();

  return (
    <>
      <Divider sx={sx} />
      {ipRangesError && <Notice text={ipRangesError} variant="error" />}
      <Box
        alignItems={includeDescriptionInTooltip ? 'center' : 'flex-start'}
        display="flex"
        flexDirection={includeDescriptionInTooltip ? 'row' : 'column'}
      >
        <Typography sx={{ font: theme.font.bold }}>
          {ASSIGN_IPV4_RANGES_TITLE}
        </Typography>
        {includeDescriptionInTooltip ? (
          <TooltipIcon
            sxTooltipIcon={{
              marginLeft: theme.spacing(0.5),
              padding: theme.spacing(0.5),
            }}
            text={<VPCRangesDescription />}
          />
        ) : (
          <VPCRangesDescription />
        )}
      </Box>
      <MultipleIPInput
        buttonText="Add IPv4 Range"
        forVPCIPv4Ranges
        ips={ipRanges}
        onChange={handleIPRangeChange}
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        placeholder="10.0.0.0/24"
        title="" // Empty string so a title isn't displayed for each IP input
      />
    </>
  );
};
