import { Box, CircleProgress, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';
import { useNetworkTransferPricesQuery } from 'src/queries/networkTransfer';
import { useObjectStorageTypesQuery } from 'src/queries/object-storage/queries';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { getDCSpecificPriceByType } from 'src/utilities/pricing/dynamicPricing';

import type { Region } from '@linode/api-v4';

interface Props {
  regionId: Region['id'];
}

export const DC_SPECIFIC_TRANSFER_POOLS_TOOLTIP_TEXT =
  'For this region, monthly network transfer is calculated and tracked independently and is not part of your global network transfer pool.';
export const GLOBAL_TRANSFER_POOL_TOOLTIP_TEXT =
  'Your global network transfer pool adds up all the included transfer associated with active Linode services on your account and is prorated based on service creation.';

export const OveragePricing = (props: Props) => {
  const { regionId } = props;

  const {
    data: objTypes,
    isError: isErrorObjTypes,
    isLoading: isLoadingObjTypes,
  } = useObjectStorageTypesQuery();
  const {
    data: transferTypes,
    isError: isErrorTransferTypes,
    isLoading: isLoadingTransferTypes,
  } = useNetworkTransferPricesQuery();

  const storageOverageType = objTypes?.find(
    (type) => type.id === 'objectstorage-overage'
  );
  const transferOverageType = transferTypes?.find(
    (type) => type.id === 'network_transfer'
  );

  const storageOveragePrice = getDCSpecificPriceByType({
    decimalPrecision: 3,
    interval: 'hourly',
    regionId,
    type: storageOverageType,
  });
  const transferOveragePrice = getDCSpecificPriceByType({
    decimalPrecision: 3,
    interval: 'hourly',
    regionId,
    type: transferOverageType,
  });

  const isDcSpecificPricingRegion = Boolean(
    transferOverageType?.region_prices.find(
      (region_price) => region_price.id === regionId
    )
  );

  return isLoadingObjTypes || isLoadingTransferTypes ? (
    <Box marginLeft={-1} marginTop={1}>
      <CircleProgress size="sm" />
    </Box>
  ) : (
    <StyledTypography>
      For this region, additional storage costs{' '}
      <strong>
        $
        {storageOveragePrice && !isErrorObjTypes
          ? parseFloat(storageOveragePrice)
          : UNKNOWN_PRICE}{' '}
        per GB
      </strong>
      .<br />
      Outbound transfer will cost{' '}
      <strong>
        $
        {transferOveragePrice && !isErrorTransferTypes
          ? parseFloat(transferOveragePrice)
          : UNKNOWN_PRICE}{' '}
        per GB
      </strong>{' '}
      if it exceeds{' '}
      {isDcSpecificPricingRegion ? (
        <>
          the{' '}
          <TextTooltip
            displayText="network transfer pool for this region"
            placement="top"
            tooltipText={DC_SPECIFIC_TRANSFER_POOLS_TOOLTIP_TEXT}
          />
        </>
      ) : (
        <>
          your{' '}
          <TextTooltip
            displayText="global network transfer pool"
            placement="top"
            tooltipText={GLOBAL_TRANSFER_POOL_TOOLTIP_TEXT}
          />
        </>
      )}
      .
    </StyledTypography>
  );
};

const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  margin: `${theme.spacing(2)} 0`,
}));
