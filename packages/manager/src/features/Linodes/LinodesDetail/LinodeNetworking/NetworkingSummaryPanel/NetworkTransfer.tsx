import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { Typography } from 'src/components/Typography';
import { useAccountNetworkTransfer } from 'src/queries/account/transfer';
import { useLinodeTransfer } from 'src/queries/linodes/stats';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import {
  getDynamicDCNetworkTransferData,
  isLinodeInDynamicPricingDC,
} from 'src/utilities/pricing/linodes';
import { readableBytes } from 'src/utilities/unitConversions';

import { TransferContent } from './TransferContent';

import type { Region } from '@linode/api-v4';

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeRegionId: Region['id'];
  linodeType: null | string;
}

export const NetworkTransfer = React.memo((props: Props) => {
  const { linodeId, linodeLabel, linodeRegionId, linodeType } = props;
  const theme = useTheme();

  const linodeTransfer = useLinodeTransfer(linodeId);
  const { isGeckoGAEnabled } = useIsGeckoEnabled();
  const { data: regions } = useRegionsQuery({
    transformRegionLabel: isGeckoGAEnabled,
  });
  const { data: type } = useTypeQuery(linodeType || '', Boolean(linodeType));
  const {
    data: accountTransfer,
    error: accountTransferError,
    isLoading: accountTransferLoading,
  } = useAccountNetworkTransfer();

  const currentRegion = regions?.find((region) => region.id === linodeRegionId);
  const dynamicDClinodeTransferData = getDynamicDCNetworkTransferData({
    networkTransferData: linodeTransfer.data,
    regionId: linodeRegionId,
  });
  const linodeUsedInGB = readableBytes(dynamicDClinodeTransferData.used, {
    unit: 'GB',
  }).value;
  const dynamicDCPoolData = getDynamicDCNetworkTransferData({
    networkTransferData: accountTransfer,
    regionId: linodeRegionId,
  });
  const totalUsedInGB = dynamicDCPoolData.used;
  const accountQuotaInGB = dynamicDCPoolData.quota;
  const error = Boolean(linodeTransfer.error || accountTransferError);
  const loading = linodeTransfer.isLoading || accountTransferLoading;
  const isDynamicPricingDC = isLinodeInDynamicPricingDC(linodeRegionId, type);

  return (
    <div>
      <Typography marginBottom={theme.spacing()}>
        <strong>Monthly Network Transfer</strong>{' '}
      </Typography>
      <TransferContent
        accountBillableInGB={accountTransfer?.billable || 0}
        accountQuotaInGB={accountQuotaInGB}
        error={error}
        isDynamicPricingDC={isDynamicPricingDC}
        linodeLabel={linodeLabel}
        linodeUsedInGB={linodeUsedInGB}
        loading={loading}
        regionName={currentRegion?.label || ''}
        totalUsedInGB={totalUsedInGB}
      />
    </div>
  );
});
