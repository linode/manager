import type { OCA } from './features/OneClickApps/types';
import type { PriceObject, Region } from '@linode/api-v4';
import type {
  AlertStatusType,
  CloudPulseServiceType,
  TPAProvider,
} from '@linode/api-v4/lib/profile';
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

interface LinodeInterfacesFlag extends BaseFeatureFlag {
  /**
   * Shows a Beta chip for UI elements related to Linode Interfaces
   */
  beta?: boolean;
  /**
   * Enables the Interface History Table
   */
  interface_history?: boolean;
  /**
   * Shows a New chip for UI elements related to Linode Interfaces
   */
  new?: boolean;
}

interface VMHostMaintenanceFlag extends BaseFeatureFlag {
  beta: boolean;
  hasQueue?: boolean;
  new: boolean;
}

interface BetaFeatureFlag extends BaseFeatureFlag {
  beta: boolean;
}

interface GeckoFeatureFlag extends BaseFeatureFlag {
  ga: boolean;
  la: boolean;
}

interface AclpFlag {
  /**
   * This property indicates whether the feature is in beta
   */
  beta: boolean;
  /**
   * This property indicates whether to bypass account capabilities check or not
   */
  bypassAccountCapabilities?: boolean;
  /**
   * This property indicates whether to show the "Download CSV" icon in the alert details page or not
   */
  enableCSVDownload?: boolean;

  /**
   * This property indicates whether the feature is enabled
   */
  enabled: boolean;

  /**
   * This property indicates whether to enable zoom in charts or not
   */
  enableZoomInCharts?: boolean;

  /**
   * This property indicates for which unit, we need to humanize the values e.g., count, iops etc.,
   */
  humanizableUnits?: string[];

  /**
   * This property indicates whether the feature is new or not
   */
  new?: boolean;

  /**
   * This property indicates whether to show widget dimension filters or not
   */
  showWidgetDimensionFilters?: boolean;
}

interface AclpLogsFlag extends BetaFeatureFlag {
  /**
   * This property indicates whether to bypass account capabilities check or not
   */
  bypassAccountCapabilities?: boolean;
  /**
   * This property indicates whether to show Custom HTTPS destination type
   */
  customHttpsEnabled?: boolean;
  /**
   * This property indicates whether to show the "Metrics" tab on Logs Stream details page or not
   */
  metricsEnabled?: boolean;
  /**
   * This property indicates whether the feature is new or not
   */
  new?: boolean;
}

interface LkeEnterpriseFlag extends BaseFeatureFlag {
  ga: boolean;
  la: boolean;
  phase2Mtc: { byoVPC: boolean; dualStack: boolean };
  postLa: boolean;
}

interface CloudNatFlag extends BetaFeatureFlag {
  ga: boolean;
  la: boolean;
}

export interface CloudPulseResourceTypeMapFlag {
  dimensionKey: string;
  maxResourceSelections?: number;
  serviceType: CloudPulseServiceType;
}

interface GpuV2 {
  egressBanner: boolean;
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
  accountAlertLimit: number;
  accountMetricLimit: number;
  alertDefinitions: boolean;
  beta: boolean;
  editDisabledStatuses?: AlertStatusType[];
  maxDimensionFiltersValues?: number;
  maxEmailChannelRecipients?: number;
  new?: boolean;
  notificationChannels: boolean;
  recentActivity: boolean;
  systemChannelSupportedServices?: CloudPulseServiceType[]; // linode, dbaas, etc.
}

interface LimitsEvolution {
  enabled: boolean;
  requestForIncreaseDisabledForAll: boolean;
  requestForIncreaseDisabledForInternalAccountsOnly: boolean;
}

interface MTC {
  /**
   * Whether the MTC feature is enabled.
   */
  enabled: boolean;
  /**
   * Region IDs where MTC is supported (Only used for Linode Migration region dropdown).
   */
  supportedRegions: Region['id'][];
}

interface FirewallRulesetsAndPrefixLists extends BetaFeatureFlag {
  ga: boolean;
  la: boolean;
}

interface ResourceLockFlag {
  linodes: boolean;
}

interface ComputePricing {
  banner: { learnMoreLink: string; text: string };
  // keyof PriceObject - ensures the LD billing value is always a valid API field name.
  // This represents active billing mode for the Compute product (e.g. 'monthly', 'hourly', etc.)
  billing: keyof PriceObject;
}

export interface Flags {
  acceleratedPlans: AcceleratedPlansFlag;
  aclp: AclpFlag;
  aclpAlerting: AclpAlerting;
  aclpAlertServiceTypeConfig: AclpAlertServiceTypeConfig[];
  aclpLogs: AclpLogsFlag;
  aclpReadEndpoint: string;
  aclpResourceTypeMap: CloudPulseResourceTypeMapFlag[];
  aclpServices: Partial<AclpServices>;
  apicliButtonCopy: string;
  apiMaintenance: APIMaintenance;
  apl: boolean;
  aplGeneralAvailability: boolean;
  aplLkeE: boolean;
  blockStorageContextualMetrics: boolean;
  blockStorageEncryption: boolean;
  blockStorageVolumeLimit: boolean;
  cloudManagerDesignUpdatesBanner: DesignUpdatesBannerFlag;
  cloudNat: CloudNatFlag;
  computePricing: ComputePricing;
  databaseAdvancedConfig: boolean;
  databaseBeta: boolean;
  databasePgBouncer: boolean;
  databasePremium: boolean;
  databaseResize: boolean;
  databaseResizeGenerationalPlans: boolean;
  databaseRestrictPlanResize: boolean;
  databases: boolean;
  databaseValkey: BetaFeatureFlag;
  databaseVpc: boolean;
  databaseVpcBeta: boolean;
  dbaasV2: BetaFeatureFlag;
  dbaasV2MonitorMetrics: BetaFeatureFlag;
  disableLargestGbPlans: boolean;
  fwRulesetsPrefixLists: FirewallRulesetsAndPrefixLists;
  gecko2: GeckoFeatureFlag;
  generationalPlansv2: GenerationalPlansFlag;
  gpuv2: GpuV2;
  hostnameEndpoints: boolean;
  iam: BaseFeatureFlag;
  iamDelegation: BaseFeatureFlag;
  iamNewBadge: boolean;
  ipv6Sharing: boolean;
  kubernetesBlackwellPlans: boolean;
  limitsEvolution: LimitsEvolution;
  linodeCloneFirewall: boolean;
  linodeCreateBanner: LinodeCreateBanner;
  linodeDiskEncryption: boolean;
  linodeInterfaces: LinodeInterfacesFlag;
  lkeEnterprise2: LkeEnterpriseFlag;
  mainContentBanner: MainContentBanner;
  marketplaceAppOverrides: MarketplaceAppOverride[];
  marketplaceV2: boolean;
  marketplaceV2GlobalBanner: boolean;
  metadata: boolean;
  mtc: MTC;
  networkLoadBalancer: boolean;
  nodebalancerIpv6: boolean;
  nodebalancerVpc: boolean;
  objectStorageContextualMetrics: boolean;
  objectStorageGen2: BaseFeatureFlag;
  objectStorageGlobalQuotas: boolean;
  objMultiCluster: boolean;
  objSummaryPage: boolean;
  passwordlessLinodes: boolean;
  placementGroupPolicyUpdate: boolean;
  privateImageSharing: boolean;
  productInformationBanners: ProductInformationBannerFlag[];
  promos: boolean;
  promotionalOffers: PromotionalOffer[];
  referralBannerText: BannerContent;
  reserveIp: boolean;
  resourceLock: ResourceLockFlag;
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
  vmHostMaintenance: VMHostMaintenanceFlag;
  volumeSummaryPage: boolean;
  vpcDbaasResources: boolean;
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
  | 'Delivery'
  | 'Domains'
  | 'Firewalls'
  | 'Identity and Access'
  | 'Images'
  | 'Kubernetes'
  | 'Linodes'
  | 'LoadBalancers'
  | 'Logs'
  | 'Longview'
  | 'Managed'
  | 'Marketplace'
  | 'Network LoadBalancers'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Placement Groups'
  | 'Reserved IPs'
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
  serviceType: CloudPulseServiceType;
  // This can be extended to have supportedRegions, supportedFilters and other tags
}

export type AclpServices = {
  [serviceType in CloudPulseServiceType]: {
    alerts?: AclpFlag;
    metrics?: AclpFlag;
  };
};

interface GenerationalPlansFlag extends BaseFeatureFlag {
  allowedPlans: string[];
}

interface LinodeCreateBanner extends BaseFeatureFlag {
  message?: string;
  pendo_id?: string;
}
