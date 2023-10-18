import { Region } from '@linode/api-v4';
import React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';
import { OBJ_STORAGE_PRICE } from 'src/utilities/pricing/constants';
import { objectStoragePriceIncreaseMap } from 'src/utilities/pricing/dynamicPricing';

interface Props {
  regionId?: Region['id'];
}

const DC_SPECIFIC_TRANSFER_POOLS_TOOLTIP_TEXT =
  'For this region, monthly network transfer is calculated and tracked independently and is not part of your global network transfer pool.';
const GLOBAL_TRANSFER_POOL_TOOLTIP_TEXT =
  'Your global network transfer pool adds up all the included transfer associated with active Linode services on our account and is prorated based on service creation.';

export const OveragePricing = (props: Props) => {
  const { regionId } = props;
  const isDcSpecificPricingRegion =
    regionId && objectStoragePriceIncreaseMap.hasOwnProperty(regionId);

  return regionId ? (
    <>
      <Typography sx={{ marginTop: '12px' }}>
        For this region, additional storage costs{' '}
        <strong>
          $
          {isDcSpecificPricingRegion
            ? objectStoragePriceIncreaseMap[regionId].storage_overage
            : OBJ_STORAGE_PRICE.storage_overage}{' '}
          per GB
        </strong>
        .
      </Typography>
      <Typography>
        Outbound transfer will cost{' '}
        <strong>
          $
          {isDcSpecificPricingRegion
            ? objectStoragePriceIncreaseMap[regionId].transfer_overage
            : OBJ_STORAGE_PRICE.transfer_overage}{' '}
          per GB
        </strong>{' '}
        if it exceeds{' '}
        {isDcSpecificPricingRegion ? (
          <>
            the{' '}
            <TextTooltip
              displayText="network transfer pool for this region"
              tooltipText={DC_SPECIFIC_TRANSFER_POOLS_TOOLTIP_TEXT}
            />
          </>
        ) : (
          <>
            your{' '}
            <TextTooltip
              displayText="global network transfer pool"
              tooltipText={GLOBAL_TRANSFER_POOL_TOOLTIP_TEXT}
            />
          </>
        )}
        .
      </Typography>
    </>
  ) : null;
};
