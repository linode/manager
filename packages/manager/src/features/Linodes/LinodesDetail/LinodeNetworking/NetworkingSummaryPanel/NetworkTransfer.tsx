import { getLinodeTransfer } from '@linode/api-v4/lib/linodes';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Typography } from 'src/components/Typography';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountTransfer } from 'src/queries/accountTransfer';
import { useRegionsQuery } from 'src/queries/regions';
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
  const { dcSpecificPricing } = useFlags();

  const linodeTransfer = useAPIRequest(
    () => getLinodeTransfer(linodeId),
    { billable: 0, quota: 0, region_transfers: [], used: 0 },
    [linodeId]
  );
  const regions = useRegionsQuery();
  const { data: type } = useTypeQuery(linodeType || '', Boolean(linodeType));
  const {
    data: accountTransfer,
    error: accountTransferError,
    isLoading: accountTransferLoading,
  } = useAccountTransfer();

  const currentRegion = regions.data?.find(
    (region) => region.id === linodeRegionId
  );
  const dynamicDClinodeTransferData = getDynamicDCNetworkTransferData({
    dcSpecificPricingFlag: dcSpecificPricing || false,
    networkTransferData: linodeTransfer.data,
    regionId: linodeRegionId,
  });
  const linodeUsedInGB = readableBytes(dynamicDClinodeTransferData.used, {
    unit: 'GB',
  }).value;
  const dynamicDCPoolData = getDynamicDCNetworkTransferData({
    dcSpecificPricingFlag: dcSpecificPricing || false,
    networkTransferData: accountTransfer,
    regionId: linodeRegionId,
  });
  const totalUsedInGB = dynamicDCPoolData.used;
  const accountQuotaInGB = dynamicDCPoolData.quota;
  const error = Boolean(linodeTransfer.error || accountTransferError);
  const loading = linodeTransfer.loading || accountTransferLoading;
  const isDynamicPricingDC = isLinodeInDynamicPricingDC(linodeRegionId, type);

  return (
    <div>
      <Typography marginBottom={theme.spacing()}>
        <strong>Monthly Network Transfer</strong>{' '}
      </Typography>
      <TransferContent
        accountBillableInGB={accountTransfer?.billable || 0}
        accountQuotaInGB={accountQuotaInGB}
        dcSpecificPricingFlag={dcSpecificPricing || false}
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
