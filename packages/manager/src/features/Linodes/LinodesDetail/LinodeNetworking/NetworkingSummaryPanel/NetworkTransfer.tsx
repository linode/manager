import {
  useAccountNetworkTransfer,
  useLinodeTransfer,
  useRegionsQuery,
  useTypeQuery,
} from '@linode/queries';
import { Typography } from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import {
  getDynamicDCNetworkTransferData,
  isLinodeInDynamicPricingDC,
} from 'src/utilities/pricing/linodes';

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
  const regions = useRegionsQuery();
  const { data: type } = useTypeQuery(linodeType || '', Boolean(linodeType));
  const {
    data: accountTransfer,
    error: accountTransferError,
    isLoading: accountTransferLoading,
  } = useAccountNetworkTransfer();

  const currentRegion = regions.data?.find(
    (region) => region.id === linodeRegionId
  );
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
