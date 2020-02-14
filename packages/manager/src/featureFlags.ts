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

type PromotionalOfferFeature =
  // "None" is used to indicate this offer isn't specific to a feature, and should
  // be displayed on the Dashboard only.
  | 'None'
  | 'Linodes'
  | 'Volumes'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Kubernetes';

export interface PromotionalOffer {
  name: string;
  body: string;
  footnote: string;
  logo: string;
  alt: string;
  backgroundColor: string;
  bodyColor: string;
  footnoteColor: string;
  features: PromotionalOfferFeature[];
  displayOnDashboard: boolean;
  displayInPrimaryNav: boolean;
}

/**
 * If the LD client hasn't been initialized, `flags`
 * (from withFeatureFlagConsumer or useFlags) will be an empty object.
 */
export type FlagSet = Partial<Flags>;
