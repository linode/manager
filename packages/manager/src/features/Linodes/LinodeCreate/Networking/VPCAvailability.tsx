import { useRegionsQuery } from '@linode/queries';
import { List, ListItem, Notice, Typography } from '@linode/ui';
import React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';

export const VPCAvailability = () => {
  const { data: regions } = useRegionsQuery();

  const regionsThatSupportVPC = regions?.filter((r) =>
    r.capabilities.includes('VPCs')
  );

  return (
    <Notice variant="warning">
      <Typography
        sx={(theme) => ({ font: theme.font.bold, fontSize: 'inherit' })}
      >
        VPCs are currently available in{' '}
        <TextTooltip
          displayText="select regions"
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
        .
      </Typography>
    </Notice>
  );
};
