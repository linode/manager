export const sideMenuAkamaiDashboard =
  '[title="Akamai - Dashboard"][href="/dashboard"]';

export const sideMenuItemsLocator = {
  accountLink: '[data-testid="menu-item-Account"][href="/account"]',
  bucketLink:
    '[data-testid="menu-item-Object Storage"][href="/object-storage/buckets"]',
  domainsLink: '[data-testid="menu-item-Domains"][href="/domains"]',
  firewallsLink: '[data-testid="menu-item-Firewalls"][href="/firewalls"]',
  imagesLink: '[data-testid="menu-item-Images"][href="/images"]',
  kubernatesLink:
    '[data-testid="menu-item-Kubernetes"][href="/kubernetes/clusters"]',
  linodesLink: '[data-testid="menu-item-Linodes"][href="/linodes"]',
  longviewLink: '[data-testid="menu-item-Longview"][href="/longview"]',
  marketplaceOneClickLink:
    '[data-testid="menu-item-Marketplace"][href="/linodes/create?type=One-Click"]',
  nodeBalancersLink:
    '[data-testid="menu-item-NodeBalancers"][href="/nodebalancers"]',
  stackScriptsLink:
    '[data-testid="menu-item-StackScripts"][href="/stackscripts"]',
  supportLink: '[data-testid="menu-item-Help & Support"][href="/support"]',
  volumesLink: '[data-testid="menu-item-Volumes"][href="/volumes"]',
};

export const topMenuItemsLocator = {
  addNewMenuButton: '[data-qa-add-new-menu-button="true"]',
  helpAndSupportLink: 'Help & Support',
  linodeCloudCommunityLink: 'Linode Cloud Community - link opens in a new tab',
  navProfileButton: '[data-testid="nav-group-profile"]',
  notificationsButton: '[aria-label="Notifications"]',
  searchIcon: '[data-qa-search-icon="true"]',
  searchInput: 'Search Products, IP Addresses, Tags...',
  toggleSideMenuButton: '[aria-label="open menu"]',
};

export const createMenuTopMenuItemsLocator = {
  bucketsLink: '[href="/object-storage/buckets/create"]',
  createMenu: '[aria-labelledby="create-menu"]',
  domainsLink: '[href="/domains/create"]',
  firewallsLink: '[href="/firewalls/create"]',
  kubernetesLink: '[href="/kubernetes/create"]',
  linodesLink: '[href="/linodes/create"]',
  marketplaceOneClickLink: '[href="/linodes/create?type=One-Click"]',
  nodeBalancersLink: '[href="/nodebalancers/create"]',
  volumesLink: '[href="/volumes/create"]',
};
