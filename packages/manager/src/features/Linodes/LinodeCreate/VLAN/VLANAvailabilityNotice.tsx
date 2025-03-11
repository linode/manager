import { List, ListItem, Notice, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';
import { useRegionsQuery } from '@linode/queries';
import { regionsWithFeature } from 'src/utilities/doesRegionSupportFeature';

import type { Region } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

export const VLANAvailabilityNotice = () => {
  const regions = useRegionsQuery().data ?? [];

  const regionsThatSupportVLANs: Region[] = regionsWithFeature(regions, 'Vlans')
    .map((region) => region)
    .sort((a, b) => a.label.localeCompare(b.label));

  const VLANsTooltipList = React.useCallback(() => {
    return (
      <StyledFormattedRegionList>
        {regionsThatSupportVLANs.map((region, idx) => (
          <ListItem disablePadding key={`vlan-${idx}`}>
            {region.label} ({region.id})
          </ListItem>
        ))}
      </StyledFormattedRegionList>
    );
  }, [regionsThatSupportVLANs]);

  return (
    <Notice variant="warning">
      <StyledNoticeTypography variant="body2">
        VLANs are currently available in&nbsp;
        <TextTooltip
          sxTypography={{
            fontFamily: (theme: Theme) => theme.font.bold,
          }}
          displayText="select regions"
          minWidth={400}
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
  columns: '2 auto',
  padding: `${theme.spacing(0.5)} ${theme.spacing()}`,
}));

const StyledNoticeTypography = styled(Typography, {
  label: 'StyledNoticeTypography',
})(({ theme }) => ({
  font: theme.font.bold,
}));
