export const activePromotions: Linode.ActivePromotion[] = [
  {
    description: 'Get $10 off your Linodes',
    expire_dt: '2019-08-20T13:52:21',
    credit_remaining: '500.00',
    this_month_credit_remaining: '10.00',
    label: 'monthly_linode_10_50',
    summary: '$50 off each month for 5 months',
    credit_monthly_cap: '50',
    image_url: 'https://my-image.com/image'
  }
];

export const account: Linode.Account = {
  active_since: 'hello world',
  address_2: 'apt b2',
  email: 'mmckenna@linode.com',
  first_name: 'Marty',
  tax_id: '',
  credit_card: {
    expiry: '07/2018',
    last_four: '1111',
    cvv: '123'
  },
  state: 'PA',
  zip: '19020',
  address_1: '123 fake st',
  country: 'US',
  last_name: 'McKenna',
  balance: 50.0,
  balance_uninvoiced: 10,
  city: 'philadelphia',
  phone: '2151231234',
  company: 'mmckenna',
  active_promotions: activePromotions
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
