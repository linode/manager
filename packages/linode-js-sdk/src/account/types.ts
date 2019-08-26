export interface CreditCard {
  expiry: string;
  last_four: string;
  cvv?: string;
}

export interface ActivePromotion {
  description: string;
  summary: string;
  expire_dt: string | null;
  credit_remaining: string;
  this_month_credit_remaining: string;
  credit_monthly_cap: string;
  image_url: string;
}

export interface Account {
  active_since: string;
  address_2: string;
  email: string;
  first_name: string;
  tax_id: string;
  credit_card: CreditCard;
  state: string;
  zip: string;
  address_1: string;
  country: string;
  last_name: string;
  balance: number;
  balance_uninvoiced: number;
  city: string;
  phone: string;
  company: string;
  active_promotions: ActivePromotion[];
  // [BETA]
  // @todo: Uncomment this when it becomes generally available
  // capabilities: AccountCapability[];
}

export interface NetworkUtilization {
  billable: number;
  used: number;
  quota: number;
}
