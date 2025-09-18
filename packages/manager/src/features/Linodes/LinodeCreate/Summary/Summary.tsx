import {
  useAllTypes,
  useImageQuery,
  useRegionsQuery,
  useTypeQuery,
} from '@linode/queries';
import { Divider, Paper, Stack, Typography } from '@linode/ui';
import { formatStorageUnits } from '@linode/utilities';
import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { TextTooltip } from 'src/components/TextTooltip';
import { useIsAclpSupportedRegion } from 'src/features/CloudPulse/Utils/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';

import { type LinodeCreateFormValues } from '../utilities';
import { getLinodePrice, parseClusterData } from './utilities';

interface SummaryProps {
  isAlertsBetaMode?: boolean;
}

export const Summary = ({ isAlertsBetaMode }: SummaryProps) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { control } = useFormContext<LinodeCreateFormValues>();

  const { data: allTypes } = useAllTypes();

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
    stackscriptData,
    clusterSize,
    clusterName,
    linodeInterfaces,
    interfaceGeneration,
    alerts,
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
      'stackscript_data',
      'stackscript_data.cluster_size',
      'stackscript_data.cluster_name',
      'linodeInterfaces',
      'interface_generation',
      'alerts',
    ],
  });

  const rawClusterData = parseClusterData(stackscriptData);

  const clusterData = rawClusterData.map((cluster) => ({
    ...cluster,
    typeData: allTypes?.find((t) => t.label === cluster.typeLabel),
  }));

  const { data: regions } = useRegionsQuery();
  const { data: type } = useTypeQuery(typeId ?? '', Boolean(typeId));
  const { data: image } = useImageQuery(imageId ?? '', Boolean(imageId));

  const { aclpBetaServices } = useFlags();

  const isAclpAlertsSupportedRegionLinode = useIsAclpSupportedRegion({
    capability: 'Linodes',
    regionId,
    type: 'alerts',
  });

  const region = regions?.find((r) => r.id === regionId);

  const backupsPrice = renderMonthlyPriceToCorrectDecimalPlace(
    getMonthlyBackupsPrice({ region: regionId, type })
  );

  const price = getLinodePrice({ clusterSize, regionId, type, clusterData });

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

  const hasBetaAclpAlertsAssigned =
    aclpBetaServices?.linode?.alerts &&
    isAclpAlertsSupportedRegionLinode &&
    isAlertsBetaMode;

  const totalBetaAclpAlertsAssignedCount =
    (alerts?.system?.length ?? 0) + (alerts?.user?.length ?? 0);

  const betaAclpAlertsAssignedList = [
    ...(alerts?.system ?? []),
    ...(alerts?.user ?? []),
  ].join(', ');

  const betaAclpAlertsAssignedDetails =
    totalBetaAclpAlertsAssignedCount > 0 ? (
      <TextTooltip
        displayText={`+${totalBetaAclpAlertsAssignedCount}`}
        minWidth={1}
        tooltipText={betaAclpAlertsAssignedList}
      />
    ) : (
      '0'
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
    ...(() => {
      if (clusterSize) {
        return [
          {
            item: {
              title:
                clusterName || (type ? formatStorageUnits(type.label) : typeId),
              details: price,
            },
            show: price,
          },
        ];
      } else {
        return [
          {
            item: {
              details: price,
              title: type ? formatStorageUnits(type.label) : typeId,
            },
            show: price,
          },
        ];
      }
    })(),
    {
      item: {
        details: `$${backupsPrice}/month`,
        title: 'Backups',
      },
      show: backupsEnabled && Boolean(type),
    },
    {
      item: {
        title: 'VLAN',
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
        title: 'VPC',
      },
      show: hasVPC,
    },
    {
      item: {
        title: 'Public Internet',
      },
      show:
        isLinodeInterfacesEnabled &&
        linodeInterfaces?.some((i) => i.purpose === 'public'),
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
    {
      item: {
        title: 'Alerts Assigned',
        details: betaAclpAlertsAssignedDetails,
      },
      show: hasBetaAclpAlertsAssigned,
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
