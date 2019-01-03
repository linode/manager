declare interface ExtendedEvent extends Linode.Event {
  _deleted?: string;
  _initial?: boolean;
}
declare interface ApplicationState {
  __resources: {
    profile: RequestableData<Linode.Profile>,
    accountSettings: RequestableData<Linode.AccountSettings>;
    types: {
      results: string[];
      entities: Linode.LinodeType[];
      loading: boolean;
      lastUpdated: number;
      error?: Linode.ApiFieldError[];
    },
    images: {
      results: string[];
      entities: Linode.Image[];
      loading: boolean;
      lastUpdated: number;
      error?: Linode.ApiFieldError[];
    },
    linodes: {
      results: number[];
      entities: Linode.Linode[];
      loading: boolean;
      lastUpdated: number;
      error?: Linode.ApiFieldError[];
    },
    domains: {
      results: number[];
      entities: Linode.Domain[];
      loading: boolean;
      lastUpdated: number;
      error?: Linode.ApiFieldError[];
    },
    volumes: {
      results: number[];
      entities: Linode.Volume[];
      loading: boolean;
      lastUpdated: number;
      error?: Linode.ApiFieldError[];
    },
  },
  authentication: AuthState;
  backups: BackupDrawerState;
  documentation: DocumentationState;
  features: FeaturesState;
  volumeDrawer: VolumeDrawerState;
  tagImportDrawer: TagImportDrawerState;
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

declare interface TagError {
  entityId: string | number;
  entityLabel?: string;
  reason: string;
}
declare interface TagImportDrawerState {
  open: boolean;
  loading: boolean;
  errors: TagError[];
  success: boolean;
}

declare interface SidebarState {
  backupsCTA: boolean;
}
declare interface BackupError {
  linodeId: number;
  reason: string;
}
declare interface BackupDrawerState {
  open: boolean;
  enabling: boolean;
  enableErrors: BackupError[];
  enableSuccess: boolean;
  updatedCount: number;
  autoEnroll: boolean;
  autoEnrollError?: string;
  enrolling: boolean;
  error?: Error | Linode.ApiFieldError[];
  data?: Linode.Linode[];
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
