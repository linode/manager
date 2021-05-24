import * as React from 'react';
import { useScript } from 'src/hooks/useScript';

interface Props {
}

type CombinedProps = Props;

const GooglePay: React.FC<CombinedProps> = (props) => {
  const googlePayStatus = useScript('https://pay.google.com/gp/p/js/pay.js');
  console.log(googlePayStatus)

  return googlePayStatus === 'ready' ? <button>Google Pay</button> : null;
};

export default GooglePay;
