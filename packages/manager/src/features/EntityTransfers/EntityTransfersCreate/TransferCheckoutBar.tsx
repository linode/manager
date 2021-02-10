import * as React from 'react';
import CheckoutBar from 'src/components/CheckoutBar';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {}

export type CombinedProps = Props;

export const TransferCheckoutBar: React.FC<Props> = props => {
  return (
    <CheckoutBar
      submitText="Generate Transfer Token"
      heading="Transfer Summary"
      onDeploy={() => null}
    />
  );
};

export default React.memo(TransferCheckoutBar);
