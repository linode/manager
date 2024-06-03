import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Divider } from 'src/components/Divider';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useImageQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Summary = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { control } = useFormContext<CreateLinodeRequest>();

  const [
    label,
    regionId,
    imageId,
    firewallId,
    typeId,
    backupsEnabled,
    privateIPEnabled,
    placementGroupId,
    vlanLabel,
    vpcId,
    diskEncryption,
  ] = useWatch({
    control,
    name: [
      'label',
      'region',
      'image',
      'firewall_id',
      'type',
      'backups_enabled',
      'private_ip',
      'placement_group.id',
      'interfaces.1.label',
      'interfaces.0.vpc_id',
      'disk_encryption',
    ],
  });

  const { data: regions } = useRegionsQuery();
  const { data: type } = useTypeQuery(typeId ?? '', Boolean(typeId));
  const { data: image } = useImageQuery(imageId ?? '', Boolean(imageId));

  const region = regions?.find((r) => r.id === regionId);

  // @todo handle marketplace cluster pricing (support many nodes by looking at UDF data)
  const price = getLinodeRegionPrice(type, regionId);

  const backupsPrice = renderMonthlyPriceToCorrectDecimalPlace(
    getMonthlyBackupsPrice({ region: regionId, type })
  );

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
        details: `$${price?.monthly}/month`,
        title: type ? formatStorageUnits(type.label) : typeId,
      },
      show: Boolean(typeId),
    },
    {
      item: {
        details: `$${backupsPrice}/month`,
        title: 'Backups',
      },
      show: backupsEnabled && Boolean(type),
    },
    {
      item: {
        title: 'VLAN Attached',
      },
      show: Boolean(vlanLabel),
    },
    {
      item: {
        title: 'Private IP',
      },
      show: privateIPEnabled,
    },
    {
      item: {
        title: 'Assigned to Placement Group',
      },
      show: Boolean(placementGroupId),
    },
    {
      item: {
        title: 'VPC Assigned',
      },
      show: Boolean(vpcId),
    },
    {
      item: {
        title: 'Firewall Assigned',
      },
      show: Boolean(firewallId),
    },
    {
      item: {
        title: 'Encrypted',
      },
      show: diskEncryption === 'enabled',
    },
  ];

  const summaryItemsToShow = summaryItems.filter((item) => item.show);

  return (
    <Paper data-qa-linode-create-summary>
      <Stack spacing={2}>
        <Typography variant="h2">Summary {label}</Typography>
        {summaryItemsToShow.length === 0 ? (
          <Typography>Please configure your Linode.</Typography>
        ) : (
          <Stack
            divider={
              isSmallScreen ? undefined : (
                <Divider
                  flexItem
                  orientation="vertical"
                  sx={{ borderWidth: 1, margin: 0 }}
                />
              )
            }
            direction={isSmallScreen ? 'column' : 'row'}
            flexWrap="wrap"
            gap={1.5}
          >
            {summaryItemsToShow.map(({ item }) => (
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
