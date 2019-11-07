const { constants } = require('../../constants');
const { apiDeleteAllDomains } = require('../../utils/common');

import ListDomains from '../../pageobjects/list-domains.page';

describe('Domains - List Suite', () => {
  let domainId, domainElement;
  const initialDomain = `a${new Date().getTime()}.com`;
  const cloneDomain = `b${new Date().getTime()}.com`;

  beforeAll(() => {
    browser.url(constants.routes.domains);
    ListDomains.globalCreate.waitForDisplayed(constants.wait.normal);
    ListDomains.progressBar.waitForDisplayed(constants.wait.normal, true);
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

  xit('should fail creating the same domain', () => {
    try {
      browser.url(constants.routes.domains);
      ListDomains.baseElemsDisplay();
      ListDomains.create(initialDomain, 'foo@bar.com');
    } catch (err) {
      ListDomains.createDomainName
        .$('p')
        .waitForDisplayed(constants.wait.normal);
      ListDomains.cancel.click();
      ListDomains.drawerTitle.waitForDisplayed(constants.wait.normal, true);
    }
  });

  xit('should display action menu options', () => {
    browser.url(constants.routes.domains);
    ListDomains.domainElem.waitForDisplayed(constants.wait.normal);
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

    ListDomains.actionMenuItem.waitForDisplayed(constants.wait.normal);
    const actionMenuItems = $$(ListDomains.actionMenuItem.selector);
    actionMenuItems.forEach(i =>
      expect(expectedMenuItems).toContain(i.getText())
    );

    $('body').click();
    ListDomains.actionMenuItem.waitForDisplayed(constants.wait.short, true);
  });

  xit('should display clone domain drawer', () => {
    ListDomains.selectActionMenuItemV2(domainElement, 'Clone');
    ListDomains.cloneDrawerElemsDisplay();

    ListDomains.closeDrawer();
  });

  xit('should fail to clone with the same domain name', () => {
    ListDomains.selectActionMenuItemV2(domainElement, 'Clone');
    ListDomains.cloneDrawerElemsDisplay();

    browser.trySetValue(
      `${ListDomains.cloneDomainName.selector} input`,
      initialDomain
    );

    ListDomains.submit.click();
    ListDomains.cloneDomainName.$('p').waitForDisplayed(constants.wait.normal);
    ListDomains.closeDrawer();
  });

  xit('should clone domain', () => {
    ListDomains.selectActionMenuItemV2(domainElement, 'Clone');
    ListDomains.clone(cloneDomain);
  });

  xit('should delete domain', () => {
    ListDomains.selectActionMenuItemV2(domainElement, 'Delete');
    ListDomains.remove(initialDomain);
  });

  afterAll(() => {
    apiDeleteAllDomains();
  });
});
