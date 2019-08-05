namespace Linode {
  export interface User {
    username: string;
    email: string;
    restricted: boolean;
    gravatarUrl?: string;
    ssh_keys: string[];
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
    active_promotions: ActivePromotions;
    // [BETA]
    // @todo: Uncomment this when it becomes generally available
    // capabilities: AccountCapability[];
  }

  // [BETA]
  export type AccountCapability =
    | 'Linodes'
    | 'NodeBalancers'
    | 'Block Storage'
    | 'Object Storage'
    | 'Kubernetes';

  export interface AccountSettings {
    managed: boolean;
    longview_subscription: string | null;
    network_helper: boolean;
    backups_enabled: boolean;
  }

  export interface ActivePromotions {
    label: string;
    description: string;
    expire_dt: string;
    credit_remaining: number;
    this_month_credit_remaining: number;
  }

  interface CreditCard {
    expiry: string;
    last_four: string;
  }

  export interface Invoice {
    id: number;
    date: string;
    label: string;
    total: number;
    tax: number;
    subtotal: number;
  }

  export interface InvoiceItem {
    amount: number;
    from: null | string;
    to: null | string;
    label: string;
    quantity: null | number;
    type: 'hourly' | 'prepay' | 'misc';
    unit_price: null | number;
    tax: number;
    total: number;
  }

  export interface Payment {
    id: number;
    date: string;
    usd: number;
  }

  export type GrantLevel = null | 'read_only' | 'read_write';

  export interface Grant {
    id: number;
    permissions: GrantLevel;
    label: string;
  }
  export type GlobalGrantTypes =
    | 'add_linodes'
    | 'add_longview'
    | 'longview_subscription'
    | 'account_access'
    | 'cancel_account'
    | 'add_domains'
    | 'add_stackscripts'
    | 'add_nodebalancers'
    | 'add_images'
    | 'add_volumes';

  export interface GlobalGrants {
    global: Record<GlobalGrantTypes, boolean | GrantLevel>;
  }

  export type GrantType =
    | 'linode'
    | 'domain'
    | 'nodebalancer'
    | 'image'
    | 'longview'
    | 'stackscript'
    | 'volume';

  export type Grants = GlobalGrants & Record<GrantType, Grant[]>;

  export interface NetworkUtilization {
    billable: number;
    used: number;
    quota: number;
  }
}
