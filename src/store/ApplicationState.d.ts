declare interface ApplicationState {
  __resources: {
    profile: RequestableData<Linode.Profile>;
  },
  authentication: AuthState;
  documentation: DocumentationState;
  resources: ResourcesState;
  volumeDrawer: VolumeDrawerState;
}

declare interface AuthState {
  token: null | string;
  scopes: null | string;
}

declare interface ResourcesState {
  profile: { loading: boolean; data: Linode.Profile };
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
