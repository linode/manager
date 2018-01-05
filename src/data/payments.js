export const apiTestPayment = {
  usd: 5.0,
  id: 1000,
  date: '2015-11-12T16:11:59',
};

export const payments = [0, 1, 2, 3, 4].reduce((result, i) => ({
  ...result,
  [i]: {
    ...apiTestPayment,
    id: apiTestPayment.id + i,
    usd: apiTestPayment.usd + i,
  },
}), {});
