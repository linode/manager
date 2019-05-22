export const account: Linode.Account = {
  active_since: 'hello world',
  address_2: 'apt b2',
  email: 'mmckenna@linode.com',
  first_name: 'Marty',
  tax_id: '',
  credit_card: {
    expiry: '07/2018',
    last_four: '1111'
  },
  state: 'PA',
  zip: '19020',
  address_1: '123 fake st',
  country: 'US',
  last_name: 'McKenna',
  balance: 0.0,
  balance_uninvoiced: 0,
  city: 'philadelphia',
  phone: '2151231234',
  company: 'mmckenna'
  // [BETA]
  // @todo: Uncomment this when it becomes generally available
  // capabilities: ['Linodes', 'NodeBalancers', 'Block Storage']
};

export const accountSettings: Linode.AccountSettings = {
  backups_enabled: true,
  managed: false,
  longview_subscription: null,
  network_helper: false
};
