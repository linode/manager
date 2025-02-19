// This file contains locators that are common to multiple pages in the Manager.

/** Top menu items. */
export const topMenuItemsLocator = {
  /** Top menu create button. */
  addNewMenuButton: '[data-qa-add-new-menu-button="true"]',
  /** Top menu notifications button. */
  notificationsButton: '[aria-label="Notifications"]',
  /** Top menu search icon. */
  searchIcon: '[data-qa-search-icon="true"]',
  /** Top menu search field. */
  searchInput: '[data-qa-main-search]',
  /** Top menu navigation toggle. */
  toggleSideMenuButton: '[aria-label="unpin menu"]',
};

/** Top menu create dropdown items. */
export const topMenuCreateItemsLocator = {
  /** Top menu create dropdown items Buckets Link. */
  bucketsLink: '[href="/object-storage/buckets/create"]',
  /** Top menu create dropdown. */
  createMenu: '[aria-labelledby="create-menu"]',
  /** Top menu create dropdown items Domains Link. */
  domainsLink: '[href="/domains/create"]',
  /** Top menu create dropdown items Firewalls Link. */
  firewallsLink: '[href="/firewalls/create"]',
  /** Top menu create dropdown items Kubernetes Link. */
  kubernetesLink: '[href="/kubernetes/create"]',
  /** Top menu create dropdown items Linodes Link. */
  linodesLink: '[href="/linodes/create"]',
  /** Top menu create dropdown items Marketplace(One-Click) Link. */
  marketplaceOneClickLink: '[href="/linodes/create?type=One-Click"]',
  /** Top menu create dropdown items NodeBalancers Link. */
  nodeBalancersLink: '[href="/nodebalancers/create"]',
  /** Top menu create dropdown items Volumes Link. */
  volumesLink: '[href="/volumes/create"]',
};
