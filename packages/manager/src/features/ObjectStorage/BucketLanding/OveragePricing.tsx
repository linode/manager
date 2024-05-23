import { Region } from '@linode/api-v4';
import { styled } from '@mui/material/styles';
import React from 'react';

import { CircularProgress } from 'src/components/CircularProgress';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';
import { useObjectStorageTypesQuery } from 'src/queries/objectStorage';
import {
  OBJ_STORAGE_PRICE,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import {
  getDCSpecificPriceByType,
  objectStoragePriceIncreaseMap,
} from 'src/utilities/pricing/dynamicPricing';

interface Props {
  regionId: Region['id'];
}

export const DC_SPECIFIC_TRANSFER_POOLS_TOOLTIP_TEXT =
  'For this region, monthly network transfer is calculated and tracked independently and is not part of your global network transfer pool.';
export const GLOBAL_TRANSFER_POOL_TOOLTIP_TEXT =
  'Your global network transfer pool adds up all the included transfer associated with active Linode services on your account and is prorated based on service creation.';

export const OveragePricing = (props: Props) => {
  const { regionId } = props;

  const { data: types, isError, isLoading } = useObjectStorageTypesQuery();

  const overageType = types?.find(
    (type) => type.id === 'objectstorage-overage'
  );

  const storageOveragePrice = getDCSpecificPriceByType({
    decimalPrecision: 3,
    interval: 'hourly',
    regionId,
    type: overageType,
  });

  const isDcSpecificPricingRegion = objectStoragePriceIncreaseMap.hasOwnProperty(
    regionId
  );

  return isLoading ? (
    <CircularProgress size={16} sx={{ marginTop: 2 }} />
  ) : (
    <>
      <StyledTypography>
        For this region, additional storage costs{' '}
        <strong>
          $
          {storageOveragePrice && !isError
            ? parseFloat(storageOveragePrice)
            : UNKNOWN_PRICE}{' '}
          per GB
        </strong>
        .
      </StyledTypography>

      <StyledTypography>
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
      </StyledTypography>
    </>
  );
};

const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  margin: `${theme.spacing(2)} 0`,
}));
