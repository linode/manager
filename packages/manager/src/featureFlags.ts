// These flags should correspond with active features flags in LD

interface TaxBanner {
  tax_name: string;
  date: string;
  linode_tax_id?: string;
}

type OneClickApp = Record<string, string>;

interface Changelog {
  version: string;
  message: string;
}

export interface Flags {
  promos: boolean;
  vatBanner: TaxBanner;
  taxBanner: TaxBanner;
  lkeHideButtons: boolean;
  firewalls: boolean;
  oneClickApps: OneClickApp;
  promotionalOffers: PromotionalOffer[];
  thirdPartyAuth: boolean;
  cmr: boolean;
  mainContentBanner: MainContentBanner;
  changelog: Changelog;
  vlans: boolean;
  cvvRequired: boolean;
  databases: boolean;
  firewallBetaNotification: boolean;
  entityTransfers: boolean;
}

type PromotionalOfferFeature =
  | 'Linodes'
  | 'Volumes'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Kubernetes';

interface PromotionalOfferButton {
  text: string;
  href: string;
  type: 'primary' | 'secondary';
}

export interface PromotionalOffer {
  name: string;
  body: string;
  footnote: string;
  logo: string;
  alt: string;
  features: PromotionalOfferFeature[];
  displayOnDashboard: boolean;
  buttons: PromotionalOfferButton[];
}

/**
 * If the LD client hasn't been initialized, `flags`
 * (from withFeatureFlagConsumer or useFlags) will be an empty object.
 */
export type FlagSet = Partial<Flags>;

export interface MainContentBanner {
  link: {
    text: string;
    url: string;
  };
  text: string;
  key: string;
}
