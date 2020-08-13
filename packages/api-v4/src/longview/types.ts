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

export interface LongviewSubscriptionPayload {
  longview_subscription?: string;
}

/** If the user is on the free plan ActiveLongviewPlan is empty
 */
export type ActiveLongviewPlan = LongviewSubscription | {};

export interface Apps {
  apache: boolean;
  nginx: boolean;
  mysql: boolean;
}
