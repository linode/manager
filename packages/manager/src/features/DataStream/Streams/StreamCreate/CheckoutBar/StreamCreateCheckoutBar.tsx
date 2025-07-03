import { Box, Divider, Typography } from '@linode/ui';
import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { CheckoutBar } from 'src/components/CheckoutBar/CheckoutBar';
import { displayPrice } from 'src/components/DisplayPrice';
import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { StyledHeader } from 'src/features/DataStream/Streams/StreamCreate/CheckoutBar/StreamCreateCheckoutBar.styles';
import { eventType } from 'src/features/DataStream/Streams/StreamCreate/types';

import type { CreateStreamForm } from 'src/features/DataStream/Streams/StreamCreate/types';

export const StreamCreateCheckoutBar = () => {
  const { control } = useFormContext<CreateStreamForm>();
  const destinationType = useWatch({ control, name: 'destination_type' });
  const formValues = useWatch({
    control,
    name: [
      eventType.Authentication,
      eventType.Authorization,
      eventType.Configuration,
      'status',
      'type',
    ],
  });
  const price = getPrice(formValues);
  const onDeploy = () => {};

  return (
    <CheckoutBar
      calculatedPrice={price}
      disabled={true}
      heading="Stream Summary"
      onDeploy={onDeploy}
      priceSelectionText="Select Data Set and define a Destination to view pricing and create a stream."
      submitText="Create Stream"
    >
      <>
        <Divider dark spacingBottom={16} spacingTop={16} />
        <Box>
          <StyledHeader mb={1}>Delivery</StyledHeader>
          <Typography mb={1}>
            {getDestinationTypeOption(destinationType)?.label ?? ''}
          </Typography>
          <Typography>{displayPrice(price)}/unit</Typography>
        </Box>
        <Divider dark spacingBottom={0} spacingTop={16} />
      </>
    </CheckoutBar>
  );
};

// TODO: remove after proper price calculation is implemented
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const getPrice = (data): number =>
  // eslint-disable-next-line sonarjs/pseudo-random
  Math.random() * 100;
