const { constants } = require('../../constants');

import ListDomains from '../../pageobjects/list-domains.page';
import DomainDetail from '../../pageobjects/domain-detail/detail.page';
import { apiDeleteAllDomains } from '../../utils/common';


describe('Domains - Detail - NS Actions Suite', () => {
    const domainName = `A${new Date().getTime()}.com`;

    beforeAll(() => {
        browser.url(constants.routes.domains);
        ListDomains.globalCreate.waitForVisible();
        ListDomains.progressBar.waitForVisible(constants.wait.normal, true);
        ListDomains.baseElemsDisplay(true);
        ListDomains.create(domainName,'foo@bar.com', true);
        ListDomains.baseElemsDisplay();
        ListDomains.domains[0].$(`${ListDomains.label.selector} a`).click();
        
        // TODO - Update to use DomainDetail.baseElemsDisplay();
        DomainDetail.domainTitle.waitForVisible();
    });

    it('should add an ns record', () => {
        DomainDetail.addNsRecord('ns7.linode.com', domainName);
    });

    afterAll(() => {
        apiDeleteAllDomains();
    });
});
