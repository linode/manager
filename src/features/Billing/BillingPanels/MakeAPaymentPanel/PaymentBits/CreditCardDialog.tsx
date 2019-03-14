import * as React from 'react';
import { compose } from 'recompose';

interface Actions {
  executePayment: () => void;
  cancel: () => void;
}

interface Props extends Actions {
  open: boolean;
  usd: string;
}

type CombinedProps = Props;

const CreditCardDialog: React.SFC<CombinedProps> = props => {
  return <div>hello world</div>;
};

export default compose<CombinedProps, Props>(React.memo)(CreditCardDialog);
