import { useRegionsQuery } from '@linode/queries';
import { List, ListItem, Notice, Typography } from '@linode/ui';
import React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';

export const VPCAvailabilityNotice = () => {
  const { data: regions } = useRegionsQuery();

  const regionsThatSupportVPC = regions?.filter((r) =>
    r.capabilities.includes('VPCs')
  );

  return (
    <Notice sx={{ width: 'fit-content' }} variant="warning">
      <Typography
        sx={(theme) => ({ font: theme.font.bold, fontSize: 'inherit' })}
      >
        VPC is not available in the selected region.{' '}
        <TextTooltip
          displayText="Available regions"
          minWidth={400}
          sxTypography={{ fontSize: 'inherit' }}
          tooltipText={
            <List sx={{ columns: '2 auto' }}>
              {regionsThatSupportVPC?.map((region) => (
                <ListItem disablePadding key={region.id} sx={{ py: 0.5 }}>
                  {region.label} ({region.id})
                </ListItem>
              ))}
            </List>
          }
        />
      </Typography>
    </Notice>
  );
};
