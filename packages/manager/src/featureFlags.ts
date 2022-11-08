import { TPAProvider } from '@linode/api-v4/lib/profile';
import { Doc } from './features/OneClickApps/FakeSpec';
// These flags should correspond with active features flags in LD

export interface TaxDetail {
  tax_id: string;
  tax_name: string;
}

interface TaxBanner {
  tax_name: string;
  date: string;
  linode_tax_id?: string;
  country_tax?: TaxDetail;
  provincial_tax_ids?: Record<string, TaxDetail>;
}

interface TaxCollectionRegion {
  name: string;
  date?: string;
}

interface TaxCollectionBanner {
  date: string;
  action?: boolean;
  regions?: TaxCollectionRegion[];
}

type OneClickApp = Record<string, string>;

export interface Flags {
  promos: boolean;
  taxBanner: TaxBanner;
  oneClickApps: OneClickApp;
  oneClickAppsDocsOverride: Record<string, Doc[]>;
  promotionalOffers: PromotionalOffer[];
  mainContentBanner: MainContentBanner;
  databases: boolean;
  tpaProviders: Provider[];
  ipv6Sharing: boolean;
  referralBannerText: ReferralBannerText;
  apiMaintenance: APIMaintenance;
  productInformationBanners: ProductInformationBannerFlag[];
  kubernetesDashboardAvailability: boolean;
  regionDropdown: boolean;
  taxCollectionBanner: TaxCollectionBanner;
  databaseBeta: boolean;
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

export interface Provider {
  name: TPAProvider;
  displayName: string;
  icon: any;
  href: string;
}

interface ReferralBannerText {
  text: string;
  link?: {
    text: string;
    url: string;
  };
}

export type ProductInformationBannerLocation = 'Object Storage' | 'Databases';

export interface ProductInformationBannerFlag {
  // `key` should be unique across product information banners
  key: string;
  // `message` is rendered as Markdown (to support links)
  message: string;
  // `bannerLocation` is the location where the banner will be rendered
  bannerLocation: ProductInformationBannerLocation;
  // The date where the banner should no longer be displayed.
  expirationDate: string;
}

export interface SuppliedMaintenanceData {
  id: string;
  title?: string;
  body?: string;
}
export interface APIMaintenance {
  maintenances: SuppliedMaintenanceData[];
}
