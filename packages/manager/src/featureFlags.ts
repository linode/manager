import type { Doc } from './features/OneClickApps/types';
import type { TPAProvider } from '@linode/api-v4/lib/profile';
import type { NoticeVariant } from 'src/components/Notice/Notice';

// These flags should correspond with active features flags in LD

export interface TaxDetail {
  tax_id: string;
  tax_name: string;
}

interface Taxes {
  country_tax?: TaxDetail;
  // If there is no date, assume the tax should be applied
  date?: string;
  provincial_tax_ids?: Record<string, TaxDetail>;
}

/**
 * @deprecated deprecated in favor of `Taxes` for Akamai Tax information
 */
interface TaxBanner {
  country_tax?: TaxDetail;
  date: string;
  provincial_tax_ids?: Record<string, TaxDetail>;
  tax_name: string;
}

interface TaxCollectionRegion {
  date?: string;
  name: string;
}

interface TaxCollectionBanner {
  action?: boolean;
  date: string;
  regions?: TaxCollectionRegion[];
}

type OneClickApp = Record<string, string>;

export interface Flags {
  aglb: boolean;
  aglbFullCreateFlow: boolean;
  apiMaintenance: APIMaintenance;
  databaseBeta: boolean;
  databaseScaleUp: boolean;
  databases: boolean;
  dcGetWell: boolean;
  firewallNodebalancer: boolean;
  ipv6Sharing: boolean;
  kubernetesDashboardAvailability: boolean;
  linodeCloneUIChanges: boolean;
  linodeCreateWithFirewall: boolean;
  mainContentBanner: MainContentBanner;
  metadata: boolean;
  objMultiCluster: boolean;
  oneClickApps: OneClickApp;
  oneClickAppsDocsOverride: Record<string, Doc[]>;
  parentChildAccountAccess: boolean;
  productInformationBanners: ProductInformationBannerFlag[];
  promos: boolean;
  promotionalOffers: PromotionalOffer[];
  recharts: boolean;
  referralBannerText: ReferralBannerText;
  regionDropdown: boolean;
  selfServeBetas: boolean;
  soldOutChips: boolean;
  taxBanner: TaxBanner;
  taxCollectionBanner: TaxCollectionBanner;
  taxes: Taxes;
  tpaProviders: Provider[];
  vmPlacement: boolean;
  vpc: boolean;
}

type PromotionalOfferFeature =
  | 'Kubernetes'
  | 'Linodes'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Volumes';

interface PromotionalOfferButton {
  href: string;
  text: string;
  type: 'primary' | 'secondary';
}

export interface PromotionalOffer {
  alt: string;
  body: string;
  buttons: PromotionalOfferButton[];
  displayOnDashboard: boolean;
  features: PromotionalOfferFeature[];
  footnote: string;
  logo: string;
  name: string;
}

/**
 * If the LD client hasn't been initialized, `flags`
 * (from withFeatureFlagConsumer or useFlags) will be an empty object.
 */
export type FlagSet = Partial<Flags>;

export interface MainContentBanner {
  key: string;
  link: {
    text: string;
    url: string;
  };
  text: string;
}

export interface Provider {
  displayName: string;
  href: string;
  icon: any;
  name: TPAProvider;
}

interface ReferralBannerText {
  link?: {
    text: string;
    url: string;
  };
  text: string;
}

export type ProductInformationBannerLocation =
  | 'Account'
  | 'Betas'
  | 'Databases'
  | 'Domains'
  | 'Firewalls'
  | 'Images'
  | 'Kubernetes'
  | 'LinodeCreate' // Use for Marketplace banners
  | 'Linodes'
  | 'LoadBalancers'
  | 'Longview'
  | 'Managed'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Placement Groups'
  | 'StackScripts'
  | 'VPC'
  | 'Volumes';

interface ProductInformationBannerDecoration {
  important: 'false' | 'true' | boolean;
  variant: NoticeVariant;
}
export interface ProductInformationBannerFlag {
  // `bannerLocation` is the location where the banner will be rendered
  bannerLocation: ProductInformationBannerLocation;
  // `decoration` is applies styling to the banner; 'important' with a 'warning' variant is standard
  decoration: ProductInformationBannerDecoration;
  // The date where the banner should no longer be displayed.
  expirationDate: string;
  // `key` should be unique across product information banners
  key: string;
  // `message` is rendered as Markdown (to support links)
  message: string;
}

export interface SuppliedMaintenanceData {
  body?: string;
  id: string;
  title?: string;
}
export interface APIMaintenance {
  maintenances: SuppliedMaintenanceData[];
}
