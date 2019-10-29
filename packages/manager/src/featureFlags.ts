// These flags should correspond with active features flags in LD

interface TaxBanner {
  tax_name: string;
  date: string;
}

type OneClickApp = Record<string, string>;

interface Flags {
  managed: boolean;
  objectStorage: boolean;
  promos: boolean;
  vatBanner: TaxBanner;
  oneClickLocation: 'sidenav' | 'createmenu';
  lkeHideButtons: boolean;
  firewalls: boolean;
  oneClickApps: OneClickApp;
  longview: boolean;
  objectStorageBilling: boolean;
  objectStorageCancel: boolean;
}

/**
 * If the LD client hasn't been initialized, `flags`
 * (from withFeatureFlagConsumer or useFlags) will be an empty object.
 */
export type FlagSet = Partial<Flags>;
