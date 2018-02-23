import { NullableString } from 'src/utils';

interface ManyResourceState<T> {
  data?: T[];
  page: number;
  pages: number;
  results: number;
}

interface ApiState {
  linodes?: ManyResourceState<Linode.Linode>;
  linodeTypes?: ManyResourceState<Linode.LinodeType>;
  images?: ManyResourceState<Linode.Image>;
}

interface AuthState {
  token: NullableString;
  scopes: NullableString;
}

export interface AppState {
  api: ApiState;
  authentication: AuthState;
}
