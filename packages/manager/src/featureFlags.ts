// These flags should correspond with active features flags in LD

interface TaxBanner {
  tax_name: string;
  date: string;
}

type OneClickApp = Record<string, string>;

interface Flags {
  promos: boolean;
  vatBanner: TaxBanner;
  lkeHideButtons: boolean;
  firewalls: boolean;
  oneClickApps: OneClickApp;
  longview: boolean;
  longviewTabs: boolean;
  promotionalOffers: PromotionalOffer[];
}

export interface PromotionalOffer {
  name: string;
  body: string;
  footnote: string;
  logo: 'Heavenly Bucket'; // Add more logos here.
  alt: string;
  backgroundColor: string;
  feature:
    | 'None'
    | 'Linodes'
    | 'Volumes'
    | 'NodeBalancers'
    | 'Object Storage'
    | 'Kubernetes';
  displayOnDashboard: boolean;
  displayInPrimaryNav: boolean;
}

/**
 * If the LD client hasn't been initialized, `flags`
 * (from withFeatureFlagConsumer or useFlags) will be an empty object.
 */
export type FlagSet = Partial<Flags>;
