declare interface ApplicationState {
  authentication: AuthState;
  resources: ResourcesState;
  documentation: DocumentationState;
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
