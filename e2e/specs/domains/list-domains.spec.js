const { constants } = require('../../constants');

import ListDomains from '../../pageobjects/list-domains.page';

describe('List Domains Suite', () => {
    let domainId, domainElement;
    const initialDomain = `a${new Date().getTime()}.com`;
    const cloneDomain = `b${new Date().getTime()}.com`;

    beforeAll(() => {
        browser.url(constants.routes.domains);
        ListDomains.globalCreate.waitForVisible();
        ListDomains.progressBar.waitForVisible(15000, true);
    });

    it('should display domains base elements', () => {
        ListDomains.baseElemsDisplay(true);
    });

    it('should create a domain', () => {
        ListDomains.create(initialDomain,'foo@bar.com', true);
    });

    it('should fail creating the same domain', () => {
        try {
            ListDomains.create(initialDomain,'foo@bar.com');
        } catch (err) {
            ListDomains.createDomainName.$('p').waitForVisible();
            ListDomains.cancel.click();
            ListDomains.drawerTitle.waitForVisible(5000, true);
        }
    });

    it('should display action menu options', () => {
        ListDomains.domainElem.waitForVisible();
        domainId = ListDomains.domains[0].getAttribute('data-qa-domain-cell');
        domainElement = `[data-qa-domain-cell="${domainId}"]`;
        
        browser.jsClick(`${domainElement} [data-qa-action-menu]`);

        const expectedMenuItems = [
            'Clone',
            'Remove',
            'Edit DNS Records',
            'Check Zone',
            'Zone File',
        ];

        ListDomains.actionMenuItem.waitForVisible();
        const actionMenuItems = $$(ListDomains.actionMenuItem.selector);
        actionMenuItems.forEach(i => expect(expectedMenuItems).toContain(i.getText()));

        // Hit escape to get rid of action menu
        // Refactor once Chrome implements actions api
        browser.keys('\uE00C');
        ListDomains.actionMenuItem.waitForVisible(5000, true);
    });

    it('should display clone domain drawer', () => {
        ListDomains.selectActionMenuItem($(domainElement), 'Clone');
        ListDomains.cloneDrawerElemsDisplay();

        ListDomains.closeDrawer();
    });

    it('should fail to clone with the same domain name', () => {
            ListDomains.selectActionMenuItem($(domainElement), 'Clone');
            ListDomains.clone(initialDomain);
            ListDomains.cloneDomainName.$('p').waitForVisible();
            ListDomains.closeDrawer();
    });

    it('should clone domain', () => {
        browser.waitForVisible('[data-qa-action-menu]');
        ListDomains.selectActionMenuItem($(domainElement), 'Clone');
        ListDomains.clone(cloneDomain);
    });

    it('should remove domain', () => {
        ListDomains.selectActionMenuItem($(domainElement), 'Remove');
        ListDomains.remove($(domainElement), initialDomain);
    });

    afterAll(() => {
        ListDomains.domains
            .forEach(d => {
                ListDomains.drawerTitle.waitForExist(5000, true);
                ListDomains.selectActionMenuItem(d, 'Remove');
                ListDomains.remove(d, d.$(ListDomains.label.selector).getText());
            });
    });
});
