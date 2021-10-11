import { addPaymentMethod, PaymentMethod } from '@linode/api-v4/lib/account';
import { queryClient } from 'src/queries/base';
import { queryKey as accountPaymentKey } from 'src/queries/accountPayment';

export const onSuccess = async (
  error: any,
  payload: any,
  enqueueSnackbar: any,
  onClose: () => void,
  setProcessing: (processing: boolean) => void
) => {
  setProcessing(true);
  // Next line is temporary for testing
  payload.nonce = 'fake-paypal-billing-agreement-nonce';

  const { nonce } = payload;

  const paymentMethods = queryClient.getQueryData<PaymentMethod[]>(
    `${accountPaymentKey}-all`
  );

  await addPaymentMethod({
    type: 'payment_method_nonce',
    data: { nonce },
    // Make PayPal default if they have no payment methods upon add
    is_default: paymentMethods?.length === 0,
  });
  queryClient.invalidateQueries(`${accountPaymentKey}-all`);

  enqueueSnackbar('Successfully added PayPal', {
    variant: 'success',
  });
  onClose();
  setProcessing(false);
};
