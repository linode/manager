const { constants } = require('../../constants');
const { apiDeleteAllDomains } = require('../../utils/common');

import ListDomains from '../../pageobjects/list-domains.page';

describe('Domains - List Suite', () => {
  let domainId, domainElement;
  const initialDomain = `a${new Date().getTime()}.com`;
  const cloneDomain = `b${new Date().getTime()}.com`;

  beforeAll(() => {
    browser.url(constants.routes.domains);
    ListDomains.globalCreate.waitForVisible(constants.wait.normal);
    ListDomains.progressBar.waitForVisible(constants.wait.normal, true);
  });

  afterAll(() => {
    apiDeleteAllDomains();
  });

  it('should display domains base elements', () => {
    ListDomains.baseElemsDisplay(true);
  });

  it('should create a domain', () => {
    ListDomains.create(initialDomain, 'foo@bar.com', true);
  });

  it('should fail creating the same domain', () => {
    try {
      browser.url(constants.routes.domains);
      ListDomains.baseElemsDisplay();
      ListDomains.create(initialDomain, 'foo@bar.com');
    } catch (err) {
      ListDomains.createDomainName.$('p').waitForVisible(constants.wait.normal);
      ListDomains.cancel.click();
      ListDomains.drawerTitle.waitForVisible(constants.wait.normal, true);
    }
  });

  it('should display action menu options', () => {
    browser.url(constants.routes.domains);
    ListDomains.domainElem.waitForVisible(constants.wait.normal);
    domainElement = `[data-qa-domain-cell="${initialDomain}"]`;

    browser.jsClick(`${domainElement} [data-qa-action-menu]`);

    const expectedMenuItems = [
      'Edit',
      'Clone',
      'Delete',
      'Edit DNS Records',
      'Check Zone',
      'Zone File'
    ];

    ListDomains.actionMenuItem.waitForVisible(constants.wait.normal);
    const actionMenuItems = $$(ListDomains.actionMenuItem.selector);
    actionMenuItems.forEach(i =>
      expect(expectedMenuItems).toContain(i.getText())
    );

    browser.click('body');
    ListDomains.actionMenuItem.waitForVisible(constants.wait.short, true);
  });

  it('should display clone domain drawer', () => {
    ListDomains.selectActionMenuItemV2(domainElement, 'Clone');
    ListDomains.cloneDrawerElemsDisplay();

    ListDomains.closeDrawer();
  });

  it('should fail to clone with the same domain name', () => {
    ListDomains.selectActionMenuItemV2(domainElement, 'Clone');
    ListDomains.cloneDrawerElemsDisplay();

    browser.trySetValue(
      `${ListDomains.cloneDomainName.selector} input`,
      initialDomain
    );

    ListDomains.submit.click();
    ListDomains.cloneDomainName.$('p').waitForVisible(constants.wait.normal);
    ListDomains.closeDrawer();
  });

  it('should clone domain', () => {
    ListDomains.selectActionMenuItemV2(domainElement, 'Clone');
    ListDomains.clone(cloneDomain);
  });

  it('should delete domain', () => {
    ListDomains.selectActionMenuItemV2(domainElement, 'Delete');
    ListDomains.remove(initialDomain);
  });

  afterAll(() => {
    apiDeleteAllDomains();
  });
});
