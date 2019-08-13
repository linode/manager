interface CreditCard {
  expiry: string;
  last_four: string;
  cvv?: string;
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
  // [BETA]
  // @todo: Uncomment this when it becomes generally available
  // capabilities: AccountCapability[];
}