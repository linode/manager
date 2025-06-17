import { Divider } from '@linode/ui';
import * as React from 'react';

import { CheckoutBar } from 'src/components/CheckoutBar/CheckoutBar';

export const StreamCreateCheckoutBar = () => {
  const onDeploy = () => {};

  return (
    <CheckoutBar
      disabled={true}
      heading="Stream Summary"
      onDeploy={onDeploy}
      priceSelectionText="Select Data Set and define a Destination to view pricing and create a stream."
      submitText="Create Stream"
    >
      <Divider dark spacingBottom={0} spacingTop={16} />
    </CheckoutBar>
  );
};
