import { useImageQuery, useRegionsQuery, useTypeQuery } from '@linode/queries';
import { Divider, Paper, Stack, Typography } from '@linode/ui';
import { formatStorageUnits } from '@linode/utilities';
import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';

import { getLinodePrice } from './utilities';

import type { LinodeCreateFormValues } from '../utilities';

export const Summary = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { control } = useFormContext<LinodeCreateFormValues>();

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
    clusterSize,
    linodeInterfaces,
    interfaceGeneration,
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
      'stackscript_data.cluster_size',
      'linodeInterfaces',
      'interface_generation',
    ],
  });

  const { data: regions } = useRegionsQuery();
  const { data: type } = useTypeQuery(typeId ?? '', Boolean(typeId));
  const { data: image } = useImageQuery(imageId ?? '', Boolean(imageId));

  const region = regions?.find((r) => r.id === regionId);

  const backupsPrice = renderMonthlyPriceToCorrectDecimalPlace(
    getMonthlyBackupsPrice({ region: regionId, type })
  );

  const price = getLinodePrice({ clusterSize, regionId, type });

  const hasVPC = isLinodeInterfacesEnabled
    ? linodeInterfaces?.some((i) => i.purpose === 'vpc' && i.vpc?.subnet_id)
    : vpcId;

  const hasVLAN = isLinodeInterfacesEnabled
    ? linodeInterfaces?.some((i) => i.purpose === 'vlan' && i.vlan?.vlan_label)
    : vlanLabel;

  const hasFirewall =
    interfaceGeneration === 'linode'
      ? linodeInterfaces.some((i) => i.firewall_id)
      : firewallId;

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
        details: price,
        title: type ? formatStorageUnits(type.label) : typeId,
      },
      show: price,
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
      show: hasVLAN,
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
      show: hasVPC,
    },
    {
      item: {
        title: 'Firewall Assigned',
      },
      show: hasFirewall,
    },
    {
      item: {
        title: 'Encrypted',
      },
      show: diskEncryption === 'enabled' || region?.site_type === 'distributed',
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
            direction={isSmallScreen ? 'column' : 'row'}
            divider={
              isSmallScreen ? undefined : (
                <Divider
                  flexItem
                  orientation="vertical"
                  sx={{ borderWidth: 1, margin: 0 }}
                />
              )
            }
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
                <Typography sx={{ font: theme.font.bold }}>
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
