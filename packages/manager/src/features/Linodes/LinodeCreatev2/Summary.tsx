import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Divider } from 'src/components/Divider';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useImageQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Summary = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const [label, regionId, imageId, firewallId, typeId] = useWatch({
    control,
    name: ['label', 'region', 'image', 'firewall_id', 'type'],
  });

  const { data: regions } = useRegionsQuery();
  const { data: type } = useTypeQuery(typeId ?? '', Boolean(typeId));
  const { data: image } = useImageQuery(imageId ?? '', Boolean(imageId));

  const region = regions?.find((r) => r.id === regionId);

  const summaryItems = [
    {
      item: {
        title: image?.label,
      },
      show: Boolean(image),
    },
    {
      item: {
        title: region?.label,
      },
      show: Boolean(region),
    },
    {
      item: {
        details: `$${type?.price.monthly}/month`,
        title: type?.label,
      },
      show: Boolean(region),
    },
    {
      item: {
        title: 'Firewall Assigned',
      },
      show: Boolean(firewallId),
    },
  ];

  const summaryItemsToShow = summaryItems.filter((item) => item.show);

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Summary {label}</Typography>
        {summaryItemsToShow.length === 0 ? (
          <Typography>Please configure your Linode.</Typography>
        ) : (
          <Stack
            divider={
              <Divider
                flexItem
                orientation="vertical"
                sx={{ borderWidth: 1, margin: 0 }}
              />
            }
            direction={{ sm: 'row', xs: 'column' }}
            gap={1.5}
          >
            {summaryItems.map(({ item }) => (
              <Stack
                alignItems="center"
                direction="row"
                key={item.title}
                spacing={1}
              >
                <Typography fontFamily={(theme) => theme.font.bold}>
                  {item.title}
                </Typography>
                {item.details && <Typography>{item.details}</Typography>}
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
