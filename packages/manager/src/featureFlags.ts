import type { OCA } from './features/OneClickApps/types';
import type { AlertServiceType, TPAProvider } from '@linode/api-v4/lib/profile';
import type { NoticeVariant } from '@linode/ui';

// These flags should correspond with active features flags in LD

export interface TaxDetail {
  qi_registration?: string;
  tax_id: string;
  tax_ids?: Record<
    'B2B' | 'B2C',
    {
      tax_id: string;
      tax_name: string;
    }
  >;
  tax_info?: string;
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

interface BaseFeatureFlag {
  enabled: boolean;
}

interface BetaFeatureFlag extends BaseFeatureFlag {
  beta: boolean;
}

interface GeckoFeatureFlag extends BaseFeatureFlag {
  ga: boolean;
  la: boolean;
}

interface AclpFlag {
  beta: boolean;
  enabled: boolean;
}

interface LkeEnterpriseFlag extends BaseFeatureFlag {
  ga: boolean;
  la: boolean;
}

export interface CloudPulseResourceTypeMapFlag {
  dimensionKey: string;
  maxResourceSelections?: number;
  serviceType: string;
  supportedRegionIds?: string;
}

interface GpuV2 {
  egressBanner: boolean;
  planDivider: boolean;
  transferBanner: boolean;
}

interface AcceleratedPlansFlag {
  linodePlans: boolean;
  lkePlans: boolean;
}

interface DesignUpdatesBannerFlag extends BaseFeatureFlag {
  key: string;
  link: string;
}

interface AclpAlerting {
  alertDefinitions: boolean;
  notificationChannels: boolean;
  recentActivity: boolean;
}

interface LimitsEvolution {
  enabled: boolean;
  requestForIncreaseDisabledForAll: boolean;
  requestForIncreaseDisabledForInternalAccountsOnly: boolean;
}

export interface Flags {
  acceleratedPlans: AcceleratedPlansFlag;
  aclp: AclpFlag;
  aclpAlerting: AclpAlerting;
  aclpAlertServiceTypeConfig: AclpAlertServiceTypeConfig[];
  aclpIntegration: boolean;
  aclpLogs: BetaFeatureFlag;
  aclpReadEndpoint: string;
  aclpResourceTypeMap: CloudPulseResourceTypeMapFlag[];
  apicliButtonCopy: string;
  apiMaintenance: APIMaintenance;
  apl: boolean;
  blockStorageEncryption: boolean;
  cloudManagerDesignUpdatesBanner: DesignUpdatesBannerFlag;
  databaseAdvancedConfig: boolean;
  databaseBeta: boolean;
  databaseResize: boolean;
  databases: boolean;
  dbaasV2: BetaFeatureFlag;
  dbaasV2MonitorMetrics: BetaFeatureFlag;
  disableLargestGbPlans: boolean;
  gecko2: GeckoFeatureFlag;
  gpuv2: GpuV2;
  iam: BetaFeatureFlag;
  ipv6Sharing: boolean;
  limitsEvolution: LimitsEvolution;
  linodeCloneFirewall: boolean;
  linodeDiskEncryption: boolean;
  linodeInterfaces: BaseFeatureFlag;
  lkeEnterprise: LkeEnterpriseFlag;
  mainContentBanner: MainContentBanner;
  marketplaceAppOverrides: MarketplaceAppOverride[];
  metadata: boolean;
  mtctt2025: boolean;
  nodebalancerVpc: boolean;
  objectStorageGen2: BaseFeatureFlag;
  objMultiCluster: boolean;
  productInformationBanners: ProductInformationBannerFlag[];
  promos: boolean;
  promotionalOffers: PromotionalOffer[];
  referralBannerText: BannerContent;
  secureVmCopy: SecureVMCopy;
  selfServeBetas: boolean;
  soldOutChips: boolean;
  supportTicketSeverity: boolean;
  taxBanner: TaxBanner;
  taxCollectionBanner: TaxCollectionBanner;
  taxes: Taxes;
  taxId: BaseFeatureFlag;
  tpaProviders: Provider[];
  udp: boolean;
  vmHostMaintenance: BetaFeatureFlag;
  vpcIpv6: boolean;
}

interface MarketplaceAppOverride {
  /**
   * Define app details that should be overwritten
   *
   * If you are adding an app that is not already defined in "oneClickApps.ts",
   * you *must* include all required OCA properties or Cloud Manager could crash.
   *
   * Pass `null` to hide the marketplace app
   */
  details: null | Partial<OCA>;
  /**
   * The ID of the StackScript that powers this Marketplace app
   */
  stackscriptId: number;
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

interface BannerContent {
  link?: {
    text: string;
    url: string;
  };
  text: string;
}

interface SecureVMCopy {
  bannerLabel?: string;
  firewallAuthorizationLabel?: string;
  firewallAuthorizationWarning?: string;
  firewallDetails?: BannerContent;
  generateActionText?: string;
  generateDocsLink: string;
  generatePrompt?: BannerContent;
  generateSuccess?: BannerContent;
  linodeCreate?: BannerContent;
}

export type ProductInformationBannerLocation =
  | 'Account'
  | 'Betas'
  | 'Databases'
  | 'DataStream'
  | 'Domains'
  | 'Firewalls'
  | 'Identity and Access'
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
  | 'Volumes'
  | 'VPC';

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

export interface AclpAlertServiceTypeConfig {
  maxResourceSelectionCount: number;
  serviceType: AlertServiceType;
  // This can be extended to have supportedRegions, supportedFilters and other tags
}
