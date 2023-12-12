import { Theme, styled } from '@mui/material/styles';
import * as React from 'react';

import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { Notice } from 'src/components/Notice/Notice';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';
import { regionsWithFeature } from 'src/utilities/doesRegionSupportFeature';

import type { Region } from '@linode/api-v4';

export const VlanAvailabilityNotice = () => {
  const regions = useRegionsQuery().data ?? [];

  const regionsThatSupportVLANs: Region[] = regionsWithFeature(regions, 'Vlans')
    .map((region) => region)
    .sort((a, b) => a.label.localeCompare(b.label));

  const VLANsTooltipList = () => (
    <StyledFormattedRegionList>
      {regionsThatSupportVLANs.map((region) => (
        <ListItem disablePadding key={`vlan-${region}`}>
          {region.label} ({region.id})
        </ListItem>
      ))}
    </StyledFormattedRegionList>
  );
  return (
    <Notice variant="warning">
      <StyledNoticeTypography variant="body2">
        VLANs are currently available in&nbsp;
        <StyledTextTooltip
          sxTypography={{
            fontFamily: (theme: Theme) => theme.font.bold,
          }}
          displayText="select regions"
          minWidth={225}
          placement="bottom-start"
          tooltipText={<VLANsTooltipList />}
          variant="body2"
        />
        .
      </StyledNoticeTypography>
    </Notice>
  );
};

const StyledFormattedRegionList = styled(List, {
  label: 'VlanFormattedRegionList',
})(({ theme }) => ({
  '& li': {
    padding: `4px 0`,
  },
  padding: `${theme.spacing(0.5)} ${theme.spacing()}`,
}));

const StyledTextTooltip = styled(TextTooltip, {
  label: 'StyledTextTooltip',
})(({ theme }) => ({
  '& .MuiList-root': {
    maxHeight: 300,
    overflowY: 'auto',
  },
}));

const StyledNoticeTypography = styled(Typography, {
  label: 'StyledNoticeTypography',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
}));
