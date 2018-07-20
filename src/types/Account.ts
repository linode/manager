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

  export interface Payment {
    id: number;
    date: string;
    usd: string | number;
  }

  export interface Grant {

  }

  export interface Grants {
    global: {
      [key: string]: bool,
    };
  }
}
