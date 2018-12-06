declare interface ExtendedEvent extends Linode.Event {
  _deleted?: string;
  _initial?: boolean;
}
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
  domainDrawer: DomainDrawerState;
  stackScriptDrawer: StackScriptDrawerState;
  /** @todo extract */
  events: {
    events: ExtendedEvent[];
    mostRecentEventTime: number;
    countUnseenEvents: number,
    inProgressEvents: Record<number, boolean>,
  }
}

declare interface AuthState {
  token: null | string;
  scopes: null | string;
}

declare type DocumentationState = Linode.Doc[];

declare interface VolumeDrawerState {
  mode: string;
  volumeId?: number;
  volumeLabel?: string;
  volumeRegion?: string;
  volumeSize?: number;
  volumeTags?: string[];
  volumePath?: string;
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  message?: string;
}

declare interface SidebarState {
  backupsCTA: boolean;
}


declare interface BackupError {
  linodeId: number;
  reason: string;
}
declare interface BackupDrawerState extends RequestableData<Linode.Linode[]> {
  open: boolean;
  enabling: boolean;
  enableErrors: BackupError[];
  enableSuccess: boolean;
  updatedCount: number;
  autoEnroll: boolean;
  autoEnrollError?: string;
  enrolling: boolean;
}

declare interface DomainDrawerState {
  open: boolean;
  mode: string;
  cloneId?: number;
  domain?: string;
}

declare interface StackScriptDrawerState {
  open: boolean;
  stackScriptId?: number;
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
