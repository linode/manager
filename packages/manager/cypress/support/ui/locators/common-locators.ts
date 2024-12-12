export const sideMenuAkamaiDashboardLocator =
  '[title="Akamai - Dashboard"][href="/dashboard"]';

export const sideMenuItemsLocator = {
  menuItemLinodes: '[data-testid="menu-item-Linodes"][href="/linodes"]',
  menuItemVolumes: '[data-testid="menu-item-Volumes"][href="/volumes"]',
  menuItemNodeBalancers:
    '[data-testid="menu-item-NodeBalancers"][href="/nodebalancers"]',
  menuItemFirewalls: '[data-testid="menu-item-Firewalls"][href="/firewalls"]',
  menuItemStackScripts:
    '[data-testid="menu-item-StackScripts"][href="/stackscripts"]',
  menuItemImages: '[data-testid="menu-item-Images"][href="/images"]',
  menuItemDomains: '[data-testid="menu-item-Domains"][href="/domains"]',
  menuItemKubernetes:
    '[data-testid="menu-item-Kubernetes"][href="/kubernetes/clusters"]',
  menuItemBucket:
    '[data-testid="menu-item-Object Storage"][href="/object-storage/buckets"]',
  menuItemLongview: '[data-testid="menu-item-Longview"][href="/longview"]',
  menuItemMarketplaceOneClick:
    '[data-testid="menu-item-Marketplace"][href="/linodes/create?type=One-Click"]',
  menuItemAccount: '[data-testid="menu-item-Account"][href="/account"]',
  menuItemSupport: '[data-testid="menu-item-Help & Support"][href="/support"]',
};
