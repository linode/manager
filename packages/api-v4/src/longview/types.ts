export interface LongviewClient {
  api_key: string;
  apps: Apps;
  created: string;
  id: number;
  install_code: string;
  label: string;
  updated: string;
}

export interface LongviewSubscription {
  clients_included: number;
  id: string;
  label: string;
  price: {
    hourly: number;
    monthly: number;
  };
}

export interface LongviewSubscriptionPayload {
  longview_subscription?: string;
}

/** If the user is on the free plan ActiveLongviewPlan is empty
 */
export type ActiveLongviewPlan = LongviewSubscription | {};

export interface Apps {
  apache: boolean;
  mysql: boolean;
  nginx: boolean;
}
