declare interface ApplicationState {
  __resources: {
    profile: RequestableData<Linode.Profile>,
    accountSettings: RequestableData<Linode.AccountSettings>
  },
  authentication: AuthState;
  backups: RequestableData<Linode.Linode[]>;
  documentation: DocumentationState;
  sidebar: SidebarState;
  features: FeaturesState;
  volumeDrawer: VolumeDrawerState;
  notifications: RequestableData<Linode.Notification[]>;
}

declare interface AuthState {
  token: null | string;
  scopes: null | string;
}

declare type DocumentationState = Linode.Doc[];

declare interface VolumeDrawerState {
  mode: string;
}

declare interface SidebarState {
  components: JSX.Element[];
}

declare interface BackupDrawerState extends RequestableData<Linode.Linode[]> {
  open: boolean;
  enabling: boolean;
  enableError?: string;
  enableSuccess: boolean;
}

declare interface RequestableData<D> {
  lastUpdated: number;
  loading: boolean;
  data?: D;
  error?: Error | Linode.ApiFieldError[];
}

declare interface AccountSettingsState extends RequestableData<Linode.AccountSettings> {
  updateError?: Linode.ApiFieldError[];
}

declare interface FeaturesState {
  linodeDetail: {
    volumes: RequestableData<Linode.Volume[]>
    disks: RequestableData<Linode.Disk[]>
  }
}
