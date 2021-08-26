interface S {
  account_unactivated: boolean;
  api_maintenance_mode: boolean;
}

export type State = Partial<S>;
