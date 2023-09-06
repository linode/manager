import { getLinodeTransfer } from '@linode/api-v4/lib/linodes';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountTransfer } from 'src/queries/accountTransfer';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { MONTHLY_NETWORK_TRANSFER_TOOLTIP_MESSAGE } from 'src/utilities/pricing/constants';
import { isLinodeInDynamicPricingDC } from 'src/utilities/pricing/linodes';
import { readableBytes } from 'src/utilities/unitConversions';

import { TransferContent } from './TransferContent';

import type { Region } from '@linode/api-v4';

interface Props {
  linodeID: number;
  linodeLabel: string;
  linodeRegionID: Region['id'];
  linodeType: null | string;
}

export const NetworkTransfer = React.memo((props: Props) => {
  const { linodeID, linodeLabel, linodeRegionID, linodeType } = props;
  const theme = useTheme();
  const { dcSpecificPricing } = useFlags();

  const linodeTransfer = useAPIRequest(
    () => getLinodeTransfer(linodeID),
    { billable: 0, quota: 0, used: 0 },
    [linodeID]
  );
  const regions = useRegionsQuery();
  const { data: type } = useTypeQuery(linodeType || '', Boolean(linodeType));
  const {
    data: accountTransfer,
    error: accountTransferError,
    isLoading: accountTransferLoading,
  } = useAccountTransfer();

  const currentRegion = regions.data?.find(
    (region) => region.id === linodeRegionID
  );
  const linodeUsedInGB = readableBytes(linodeTransfer.data.used, {
    unit: 'GB',
  }).value;
  const totalUsedInGB = accountTransfer?.used || 0;
  const accountQuotaInGB = accountTransfer?.quota || 0;
  const error = Boolean(linodeTransfer.error || accountTransferError);
  const loading = linodeTransfer.loading || accountTransferLoading;
  const isDynamicPricingDC = isLinodeInDynamicPricingDC(linodeRegionID, type);

  const dynamicDCTooltip = isDynamicPricingDC ? (
    <TextTooltip
      displayText={`${currentRegion?.label} datacenter` || ''}
      minWidth={275}
      placement="right-end"
      tooltipText={MONTHLY_NETWORK_TRANSFER_TOOLTIP_MESSAGE}
    />
  ) : null;

  return (
    <div>
      <Typography marginBottom={theme.spacing()}>
        <strong>Monthly Network Transfer</strong>{' '}
      </Typography>
      {dcSpecificPricing && (
        <Typography
          fontSize="0.8rem"
          lineHeight={1.2}
          marginBottom={theme.spacing()}
        >
          Usage by {linodeLabel} of the {dynamicDCTooltip} Monthly Network
          Transfer Pool.
        </Typography>
      )}
      <TransferContent
        accountBillableInGB={accountTransfer?.billable || 0}
        accountQuotaInGB={accountQuotaInGB}
        error={error}
        linodeLabel={linodeLabel}
        linodeUsedInGB={linodeUsedInGB}
        loading={loading}
        totalUsedInGB={totalUsedInGB}
      />
    </div>
  );
});
