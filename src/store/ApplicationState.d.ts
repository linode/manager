declare interface ApplicationState {
  __resources: {
    profile: RequestableData<Linode.Profile>;
  },
  authentication: AuthState;
  documentation: DocumentationState;
  volumeDrawer: VolumeDrawerState;
}

declare interface AuthState {
  token: null | string;
  scopes: null | string;
}

declare type DocumentationState = Linode.Doc[];

declare interface VolumeDrawerState {
  mode: string;
}

declare interface RequestableData<D> {
  lastUpdated: number;
  loading: boolean;
  data?: D;
  error?: Error;
}
