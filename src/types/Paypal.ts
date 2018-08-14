namespace Paypal {
  export interface AuthData {
    intent: string;
    orderID: string;
    payerID: string;
    paymentID: string;
    returnUrl: string
  }

  interface Client {
    sandbox: string;
    production: string;
  }

  /*
  * Please note. The is not the full list of available props
  * but for our purposes, these are the ones we require
  */
  export interface PayButtonProps {
    client: Client,
    onAuthorize: () => void;
    onCancel: () => void;
    onClick: () => void;
    payment: () => string;
  }
}