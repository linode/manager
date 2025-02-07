import { Box, Divider, Notice, TooltipIcon, Typography } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import {
  ASSIGN_COMPUTE_INSTANCE_TO_VPC_LINK,
  ASSIGN_IPV4_RANGES_DESCRIPTION,
  ASSIGN_IPV4_RANGES_TITLE,
} from 'src/features/VPCs/constants';

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
            status="help"
            text={IPv4RangesDescriptionJSX}
          />
        ) : (
          <Typography variant="body1">{IPv4RangesDescriptionJSX}</Typography>
        )}
      </Box>
      <MultipleIPInput
        buttonText="Add IPv4 Range"
        forVPCIPv4Ranges
        ips={ipRanges}
        onChange={handleIPRangeChange}
        placeholder="10.0.0.0/24"
        title="" // Empty string so a title isn't displayed for each IP input
      />
    </>
  );
};

const StyledDescription = styled('span')(() => ({
  marginRight: '5px',
}));

const IPv4RangesDescriptionJSX = (
  <>
    <StyledDescription>{ASSIGN_IPV4_RANGES_DESCRIPTION}</StyledDescription>
    <Link to={ASSIGN_COMPUTE_INSTANCE_TO_VPC_LINK}>Learn more</Link>.
  </>
);
