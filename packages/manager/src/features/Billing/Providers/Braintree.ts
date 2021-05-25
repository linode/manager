import braintree, { Client } from 'braintree-web';

export const getBraintreeClient = async (
  client_token: string
): Promise<Client> => {
  return await braintree.client.create({
    authorization: client_token,
  });
};
