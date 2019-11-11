export interface LongviewClient {
  id: number;
  created: string;
  label: string;
  updated: string;
  api_key: string;
  install_code: string;
  apps: Apps;
}

export interface LongviewSubscription {
  id: string;
  label: string;
  clients_included: number;
  price: {
    hourly: number;
    monthly: number;
  };
}

export interface Apps {
  apache: boolean;
  nginx: boolean;
  mysql: boolean;
}
