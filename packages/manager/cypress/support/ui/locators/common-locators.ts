// This file contains locators that are common to multiple pages in the Manager.

// Top menu items
export const topMenuItemsLocator = {
  // Create Button
  addNewMenuButton: '[data-qa-add-new-menu-button="true"]',
  // Notifications Button
  notificationsButton: '[aria-label="Notifications"]',
  // Search Icon
  searchIcon: '[data-qa-search-icon="true"]',
  // Search Text Field
  searchInput: '[data-qa-main-search]',
  // Toogle side menu bar button
  toggleSideMenuButton: '[aria-label="open menu"]',
};

// Create menu items
export const topMenuCreateItemsLocator = {
  // Buckets Link
  bucketsLink: '[href="/object-storage/buckets/create"]',
  // Create Menu dropdown section
  createMenu: '[aria-labelledby="create-menu"]',
  // Domains Link
  domainsLink: '[href="/domains/create"]',
  // Firewalls Link
  firewallsLink: '[href="/firewalls/create"]',
  // Kubernetes Link
  kubernetesLink: '[href="/kubernetes/create"]',
  // Linodes Link
  linodesLink: '[href="/linodes/create"]',
  // Marketplace Link
  marketplaceOneClickLink: '[href="/linodes/create?type=One-Click"]',
  // NodeBalancers Link
  nodeBalancersLink: '[href="/nodebalancers/create"]',
  // Volumes Link
  volumesLink: '[href="/volumes/create"]',
};
