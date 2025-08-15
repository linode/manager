import { Box, Divider, Typography } from '@linode/ui';
import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { CheckoutBar } from 'src/components/CheckoutBar/CheckoutBar';
import { displayPrice } from 'src/components/DisplayPrice';
import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { StyledHeader } from 'src/features/DataStream/Streams/StreamForm/CheckoutBar/StreamFormCheckoutBar.styles';

import type { StreamAndDestinationFormType } from 'src/features/DataStream/Streams/StreamForm/types';

export interface Props {
  createStream: () => void;
}

export const StreamFormCheckoutBar = (props: Props) => {
  const { createStream } = props;
  const { control } = useFormContext<StreamAndDestinationFormType>();
  const destinationType = useWatch({ control, name: 'destination.type' });
  const formValues = useWatch({
    control,
    name: [
      'stream.status',
      'stream.type',
      'stream.details.cluster_ids',
      'stream.details.is_auto_add_all_clusters_enabled',
    ],
  });
  const price = getPrice(formValues);

  return (
    <CheckoutBar
      calculatedPrice={price}
      disabled={false}
      heading="Stream Summary"
      onDeploy={createStream}
      priceSelectionText="Select Cluster and define a Destination to view pricing and create a stream."
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
