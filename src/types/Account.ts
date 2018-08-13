namespace Linode {
  export interface User {
    username: string;
    email: string;
    restricted: boolean;
    gravatarUrl?: string;
  }

  export interface Account {
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
    city: string;
    phone: string;
    company: string;
  }

  export interface AccountSettings {
    managed: boolean;
    longview_subscription: string | null;
    network_helper: boolean;
  }
  interface CreditCard {
    expiry: string;
    last_four: string;
  }

  export interface Invoice {
    id: number;
    date: string;
    label: string;
    total: string | number;
  }

  export interface InvoiceItem {
    amount: number;
    from: null | string;
    to: null | string;
    label: string;
    quantity: null | number;
    type: 'hourly' | 'prepay' | 'misc';
    unit_price: null | number;
  }

  export interface Payment {
    id: number;
    date: string;
    usd: string | number;
  }

  export type GrantLevel = null | 'read_only' | 'read_write';

  export interface Grant {
    id: number;
    permissions: GrantLevel;
    label: string;
  }

  export interface GlobalGrants {
    global: {
      [key: string]: boolean | GrantLevel,
    };
  }

  export type Grants = GlobalGrants & {
    [key: string]: Grant[];
  }

  export interface NetworkUtilization {
   billable: number;
   used: number;
   quota: number;
  }
}


