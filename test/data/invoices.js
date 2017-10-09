export const apiTestInvoice = {
  date: '2016-12-12T15:07:47',
  label: 'Invoice #1234',
  id: 1234,
  total: 10,
};

export const testInvoice = {
  ...apiTestInvoice,
  _polling: false,
};

export const testInvoice2 = {
  ...testInvoice,
  date: '2016-12-13T15:07:47',
  label: 'Invoice #1235',
  id: 1235,
};

export const testInvoice3 = {
  ...testInvoice,
  date: '2016-12-14T15:07:47',
  label: 'Invoice #1236',
  id: 1236,
  total: -8,
};

export const testInvoice4 = {
  ...testInvoice,
  date: '2016-12-15T15:07:47',
  label: 'Invoice #1237',
  id: 1237,
  total: 25,
};

export const testInvoice5 = {
  ...testInvoice,
  date: '2016-12-16T15:07:47',
  label: 'Invoice #1238',
  id: 1238,
  total: 12,
};

export const invoices = {
  [testInvoice.id]: testInvoice,
  [testInvoice2.id]: testInvoice2,
  [testInvoice3.id]: testInvoice3,
  [testInvoice4.id]: testInvoice4,
  [testInvoice5.id]: testInvoice5,
};
